'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v1';

const joinFamilyFlow = ai.defineFlow(
  {
    name: 'joinFamilyFlow',
    inputSchema: z.object({ familyId: z.string() }),
    outputSchema: z.void(),
  },
  async (input, context) => {
    const { familyId } = input;
    const uid = context.auth?.uid;

    if (!uid) {
      throw new HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const firestore = getFirestore();
    const familyRef = firestore.collection('families').doc(familyId);
    const userRef = firestore.collection('users').doc(uid);

    await firestore.runTransaction(async (transaction) => {
      const familyDoc = await transaction.get(familyRef);
      if (!familyDoc.exists) {
        throw new HttpsError('not-found', `Family with ID ${familyId} not found.`);
      }
      transaction.update(familyRef, { memberIds: FieldValue.arrayUnion(uid) });
      transaction.update(userRef, { familyId: familyId });
    });
    console.log(`User ${uid} successfully joined family ${familyId} via Cloud Function.`);
  }
);

export const joinFamily = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    const input = { familyId: data.familyId };
    
    await ai.runFlow(joinFamilyFlow, input, { auth: { uid: context.auth.uid, custom: context.auth.token } });

    return { status: 'success', message: 'Successfully joined family.' };
});
