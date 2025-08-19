import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  currentStep: string | null;
  openModal: (step?: string) => void;
  closeModal: () => void;
  replaceModal: (nextStep: string) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  currentStep: null,

  openModal: (step?: string) =>
    set(() => {
      //스크롤 방지
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return { isOpen: true, currentStep: step || null };
    }),

  closeModal: () =>
    set(() => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }

      return { isOpen: false, currentStep: null };
    }),

  replaceModal: (nextStep: string) =>
    set(() => {
      return { currentStep: nextStep };
    }),
}));
