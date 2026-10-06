import { create } from 'zustand';
import { UserProfileData } from '../types/profile.types';

interface ProfileState {
  profile: UserProfileData | null;
  isEditing: boolean;
  setProfile: (profile: UserProfileData | null) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isEditing: false,
  setProfile: (profile) => set({ profile }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));
