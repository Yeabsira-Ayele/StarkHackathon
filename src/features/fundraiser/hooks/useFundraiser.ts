import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fundraiserApi } from '../api/fundraiser.api';
import { FundraiserCreationData } from '../types/fundraiser.types';
import { useFundraiserStore } from '../store/fundraiser.store';

export const useFundraiser = () => {
  const queryClient = useQueryClient();
  const { draft, updateDraft, currentStep, setStep, resetDraft } = useFundraiserStore();

  const publishMutation = useMutation({
    mutationFn: (data: FundraiserCreationData) => fundraiserApi.publishProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      resetDraft();
    },
  });

  return {
    draft,
    updateDraft,
    currentStep,
    setStep,
    resetDraft,
    publishProject: publishMutation.mutateAsync,
    isPublishing: publishMutation.isPending,
    error: publishMutation.error,
  };
};
