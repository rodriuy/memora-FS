
export type Story = {
  id: string;
  title: string;
  narrator: string;
  transcription: string;
  audioUrl: string;
  status: 'completed' | 'transcribing' | 'uploading';
  imageId: string;
  isDonated: boolean;
};

export type FamilyMember = {
  id: string;
  name: string;
  role: 'Admin' | 'Member';
  avatarId: string;
};

export type Device = {
  id: string;
  name: string;
  status: 'active' | 'pending_pairing';
};
