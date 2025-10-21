import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, serverTimestamp, collection, addDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "fs";

let testEnv: RulesTestEnvironment;

const MY_PROJECT_ID = "memora-dev";
const myAuth = { uid: "user-abc", email: "abc@example.com" };
const otherAuth = { uid: "user-xyz", email: "xyz@example.com" };
const myFamilyId = "family-123";
const otherFamilyId = "family-456";

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: MY_PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

after(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Memora Firestore Security Rules", () => {

  // Setup a family document for testing member-only rules
  async function setupFamily() {
    const adminDb = testEnv.authenticatedContext(myAuth.uid).firestore();
    const familyDoc = doc(adminDb, `families/${myFamilyId}`);
    await setDoc(familyDoc, { 
      adminId: myAuth.uid, 
      memberIds: [myAuth.uid, "user-def"], 
      name: "My Test Family"
    });
  }

  describe("Users collection", () => {
    it("should not allow any authenticated user to list all users", async () => {
      const db = testEnv.authenticatedContext(myAuth.uid).firestore();
      const usersCol = collection(db, "users");
      await assertFails(getDocs(usersCol));
    });

    it("should allow a user to update their own profile", async () => {
        const db = testEnv.authenticatedContext(myAuth.uid).firestore();
        const userDoc = doc(db, `users/${myAuth.uid}`);
        await setDoc(userDoc, { id: myAuth.uid, familyId: myFamilyId, name: "Old Name" });

        await assertSucceeds(updateDoc(userDoc, { name: "New Name" }));
    });

    it("should NOT allow a user to change their familyId", async () => {
        const db = testEnv.authenticatedContext(myAuth.uid).firestore();
        const userDoc = doc(db, `users/${myAuth.uid}`);
        await setDoc(userDoc, { id: myAuth.uid, familyId: myFamilyId, name: "Old Name" });

        await assertFails(updateDoc(userDoc, { familyId: otherFamilyId }));
    });
  });

  describe("Families collection", () => {
    beforeEach(setupFamily);

    it("should not allow unauthenticated users to read from a family collection", async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const familyDoc = doc(unauthedDb, `families/${myFamilyId}`);
      await assertFails(getDoc(familyDoc));
    });

    it("should not allow a non-member to read from a family collection", async () => {
      const db = testEnv.authenticatedContext(otherAuth.uid).firestore();
      const familyDoc = doc(db, `families/${myFamilyId}`);
      await assertFails(getDoc(familyDoc));
    });

    it("should allow a member to read from their family collection", async () => {
      const db = testEnv.authenticatedContext(myAuth.uid).firestore();
      const familyDoc = doc(db, `families/${myFamilyId}`);
      await assertSucceeds(getDoc(familyDoc));
    });

    it("should allow creating a family with correct admin and member IDs", async () => {
        const db = testEnv.authenticatedContext(myAuth.uid).firestore();
        const newFamilyData = {
            adminId: myAuth.uid,
            memberIds: [myAuth.uid],
            name: "A New Family"
        };
        await assertSucceeds(addDoc(collection(db, "families"), newFamilyData));
    });

    it("should NOT allow creating a family where the creator is not the admin", async () => {
        const db = testEnv.authenticatedContext(myAuth.uid).firestore();
        const newFamilyData = {
            adminId: otherAuth.uid, // Incorrect admin
            memberIds: [myAuth.uid],
            name: "A Bad Family"
        };
        await assertFails(addDoc(collection(db, "families"), newFamilyData));
    });
  });

  describe("Stories subcollection", () => {
    beforeEach(setupFamily);

    it("should not allow a non-member to create a story", async () => {
        const db = testEnv.authenticatedContext(otherAuth.uid).firestore();
        const storyData = { title: "A Wild Story Appears", content: "..." };
        const storyRef = doc(db, `families/${myFamilyId}/stories/story-1`);
        await assertFails(setDoc(storyRef, storyData));
    });

    it("should allow a family member to create a story", async () => {
        const db = testEnv.authenticatedContext(myAuth.uid).firestore();
        const storyData = { title: "Our Family Story", content: "..." };
        const storyRef = doc(db, `families/${myFamilyId}/stories/story-1`);
        await assertSucceeds(setDoc(storyRef, storyData));
    });
  });
});