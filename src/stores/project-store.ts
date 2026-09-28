import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  selectedProjectSlug: string | null;
  selectedProjectName: string | null;
  setSelectedProject: (slug: string, name: string) => void;
  clearSelectedProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectSlug: null,
      selectedProjectName: null,
      setSelectedProject: (slug, name) =>
        set({ selectedProjectSlug: slug, selectedProjectName: name }),
      clearSelectedProject: () =>
        set({ selectedProjectSlug: null, selectedProjectName: null }),
    }),
    {
      name: "selected-project",
      partialize: (state) => ({
        selectedProjectSlug: state.selectedProjectSlug,
        selectedProjectName: state.selectedProjectName,
      }),
    },
  ),
);
