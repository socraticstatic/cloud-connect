import { StateCreator } from 'zustand';

export interface UISlice {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  activeTab: 'connections',
  setActiveTab: (tab) => set({ activeTab: tab }),
});