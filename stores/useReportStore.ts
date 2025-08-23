import { create } from 'zustand';

interface ReportState {
  reportId: string | null;
  jobId: string | null;
  setReportId: (id: string) => void;
  setJobId: (id: string) => void;
  clearReportId: () => void;
  clearJobId: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reportId: null,
  jobId: null,
  setReportId: (id: string) => set({ reportId: id }),
  setJobId: (id: string) => set({ jobId: id }),
  clearReportId: () => set({ reportId: null }),
  clearJobId: () => set({ jobId: null }),
}));
