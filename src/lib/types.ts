
export type Story = {
  id: string;
  familyId: string;
  title: string;
  narrator: string;
  audioUrl: string;
  transcription: string;
  status: 'completed' | 'transcribing' | 'uploading' | 'failed';
  imageId?: string;
  isDonated: boolean;
  createdAt: any; // Firestore Timestamp
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  familyId: string;
  avatarId?: string;
  bio?: string;
};

export type Family = {
  id: string;
  familyName: string;
  adminId: string;
  memberIds: string[];
  subscriptionTier: 'free' | 'premium';
}

export type Device = {
  id: string;
  boxId: string;
  familyId: string;
  status: 'active' | 'pending_pairing';
};
