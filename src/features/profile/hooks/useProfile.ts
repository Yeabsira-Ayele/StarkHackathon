import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { useProfileStore } from '../store/profile.store';
import { ProfileUpdateFormData } from '../schemas/profile.schema';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { profile: localProfile, setProfile, isEditing, setIsEditing } = useProfileStore();

  const profileQuery = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const data = await profileApi.getProfile();
      setProfile(data);
      return data;
    },
    initialData: localProfile,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileUpdateFormData) => profileApi.updateProfile(data),
    onSuccess: (updated) => {
      setProfile(updated);
      queryClient.setQueryData(['profile', 'me'], updated);
      setIsEditing(false);
    },
  });

  return {
    profile: profileQuery.data || localProfile,
    isLoading: profileQuery.isLoading,
    isUpdating: updateMutation.isPending,
    isEditing,
    setIsEditing,
    updateProfile: updateMutation.mutateAsync,
  };
};
