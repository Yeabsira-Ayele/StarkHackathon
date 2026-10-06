import { create } from 'zustand';
import { TransparencyOverview, TransparencyAuditRecord } from '../types/reports.types';

interface ReportsState {
  overview: TransparencyOverview | null;
  selectedSector: string | null;
  selectedRecord: TransparencyAuditRecord | null;
  setSelectedSector: (sector: string | null) => void;
  setSelectedRecord: (record: TransparencyAuditRecord | null) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  overview: null,
  selectedSector: null,
  selectedRecord: null,
  setSelectedSector: (selectedSector) => set({ selectedSector }),
  setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
}));
