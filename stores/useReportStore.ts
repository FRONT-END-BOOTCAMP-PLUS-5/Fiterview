import { create } from 'zustand';

interface ReportState {
  reportId: string | null;
  setReportId: (id: string) => void;
  clearReportId: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reportId: null,
  setReportId: (id: string) => set({ reportId: id }),
  clearReportId: () => set({ reportId: null }),
}));
