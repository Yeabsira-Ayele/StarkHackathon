import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import { useReportsStore } from '../store/reports.store';

export const useReports = () => {
  const { overview: localOverview, selectedSector, setSelectedSector, selectedRecord, setSelectedRecord } = useReportsStore();

  const overviewQuery = useQuery({
    queryKey: ['reports', 'transparency'],
    queryFn: () => reportsApi.getTransparencyOverview(),
  });

  return {
    overview: overviewQuery.data || localOverview,
    isLoading: overviewQuery.isLoading,
    error: overviewQuery.error,
    selectedSector,
    setSelectedSector,
    selectedRecord,
    setSelectedRecord,
  };
};
