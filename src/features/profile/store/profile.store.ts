import { create } from 'zustand';
import { UserProfileData } from '../types/profile.types';
import { MOCK_USER_PROFILE } from '../data/profile.data';

interface ProfileState {
  profile: UserProfileData;
  isEditing: boolean;
  setProfile: (profile: UserProfileData) => void;
  setIsEditing: (editing: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: MOCK_USER_PROFILE,
  isEditing: false,
  setProfile: (profile) => set({ profile }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));
