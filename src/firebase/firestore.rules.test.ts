
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readFileSync } from "fs";

let testEnv: RulesTestEnvironment;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "memora-dev",
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
  it("should not allow unauthenticated users to write to the families collection", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const familyDoc = doc(unauthedDb, "families/someFamily");
    await assertFails(
      setDoc(familyDoc, { name: "The Simpsons" })
    );
  });

  it("should not allow unauthenticated users to read from the families collection", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const familyDoc = doc(unauthedDb, "families/someFamily");
    await assertFails(getDoc(familyDoc));
  });
});
