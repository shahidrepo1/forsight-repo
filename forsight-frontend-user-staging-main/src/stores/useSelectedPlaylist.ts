import { create } from "zustand";

type Store = {
  selectedProfiles: Array<number>;
  toggleProfile: (id: number) => void;
  clearProfiles: () => void;
  addProfiles: (ids: Array<number>) => void;

  selectedKeywords: Array<number>;
  toggleKeyword: (id: number) => void;
  clearKeywords: () => void;
  addKeywords: (ids: Array<number>) => void;
};

export const useSelectedPlaylist = create<Store>((set) => ({
  selectedProfiles: [],
  selectedKeywords: [],

  toggleProfile: (id: number) => {
    set((state) => ({
      selectedProfiles: state.selectedProfiles.includes(id)
        ? state.selectedProfiles.filter((profileId) => profileId !== id)
        : [...state.selectedProfiles, id],
    }));
  },

  toggleKeyword: (id: number) => {
    set((state) => ({
      selectedKeywords: state.selectedKeywords.includes(id)
        ? state.selectedKeywords.filter((keywordId) => keywordId !== id)
        : [...state.selectedKeywords, id],
    }));
  },

  clearProfiles: () => {
    set({ selectedProfiles: [] });
  },
  clearKeywords: () => {
    set({ selectedKeywords: [] });
  },

  // Add an array of profiles to the selectedProfiles array
  addProfiles: (ids: Array<number>) => {
    set((state) => ({
      selectedProfiles: Array.from(
        new Set([...state.selectedProfiles, ...ids])
      ),
    }));
  },

  // Add an array of keywords to the selectedKeywords array
  addKeywords: (ids: Array<number>) => {
    set((state) => ({
      selectedKeywords: Array.from(
        new Set([...state.selectedKeywords, ...ids])
      ),
    }));
  },
}));
