'use server';

import { ai } from './genkit';
import { z } from 'genkit';
import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, CallableContext } from 'firebase-functions/https';

const joinFamilyFlow = ai.defineFlow(
  {
    name: 'joinFamilyFlow',
    inputSchema: z.object({ familyId: z.string(), uid: z.string() }),
    outputSchema: z.void(),
  },
  async (input) => {
    const { familyId, uid } = input;

    if (!uid) {
      // This check is technically redundant if always called from the wrapper, but good for safety.
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

export const joinFamily = functions.https.onCall(async (data, context: CallableContext) => {
    if (!context || !context.auth) {
        throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    const input = { familyId: data.familyId, uid: context.auth.uid };
    
    await ai.runFlow(joinFamilyFlow, input);

    return { status: 'success', message: 'Successfully joined family.' };
});
