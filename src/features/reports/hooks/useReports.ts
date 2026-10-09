import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import { useReportsStore } from '../store/reports.store';

export const useReports = () => {
  const { selectedSector, setSelectedSector, selectedRecord, setSelectedRecord } = useReportsStore();

  const overviewQuery = useQuery({
    queryKey: ['reports', 'transparency'],
    queryFn: () => reportsApi.getTransparencyOverview(),
  });

  return {
    overview: overviewQuery.data,
    isLoading: overviewQuery.isPending,
    error: overviewQuery.error,
    refetch: overviewQuery.refetch,
    selectedSector,
    setSelectedSector,
    selectedRecord,
    setSelectedRecord,
  };
};

export const useMyReports = (userId: string | undefined, enabled = true) => useQuery({
  queryKey: ['reports', 'mine', userId],
  queryFn: () => reportsApi.getMyReports(),
  enabled: Boolean(userId) && enabled,
});
