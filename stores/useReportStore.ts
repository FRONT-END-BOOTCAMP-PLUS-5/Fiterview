import { create } from 'zustand';

interface ReportState {
  reportId: string | null;
  jobId: string | null;
  onReportCompleted?: () => void;
  setReportId: (id: string) => void;
  setJobId: (id: string) => void;
  setOnReportCompleted: (callback: () => void) => void;
  clearReportId: () => void;
  clearJobId: () => void;
  clearOnReportCompleted: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reportId: null,
  jobId: null,
  onReportCompleted: undefined,
  setReportId: (id: string) => set({ reportId: id }),
  setJobId: (id: string) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('fiterview_job_id', id);
      } catch {}
    }
    set({ jobId: id });
  },
  setOnReportCompleted: (callback: () => void) => set({ onReportCompleted: callback }),
  clearReportId: () => set({ reportId: null }),
  clearJobId: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('fiterview_job_id');
      } catch {}
    }
    set({ jobId: null });
  },
  clearOnReportCompleted: () => set({ onReportCompleted: undefined }),
}));
