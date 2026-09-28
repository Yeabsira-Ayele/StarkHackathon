import { create } from 'zustand';
import { TransparencyOverview, TransparencyAuditRecord } from '../types/reports.types';
import { MOCK_TRANSPARENCY_OVERVIEW } from '../data/reports.data';

interface ReportsState {
  overview: TransparencyOverview;
  selectedSector: string | null;
  selectedRecord: TransparencyAuditRecord | null;
  setSelectedSector: (sector: string | null) => void;
  setSelectedRecord: (record: TransparencyAuditRecord | null) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  overview: MOCK_TRANSPARENCY_OVERVIEW,
  selectedSector: null,
  selectedRecord: null,
  setSelectedSector: (selectedSector) => set({ selectedSector }),
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
}));
