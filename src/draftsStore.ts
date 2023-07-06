import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Entry, EntryForm } from "./api";

interface DraftsState {
  newEntry: EntryForm;
  followUps: { [id: string]: EntryForm };
  supersedes: { [id: string]: EntryForm };
  getOrCreateFollowUpDraft: (entry: Entry) => EntryForm;
  getOrCreateSupersedingDraft: (entry: Entry) => EntryForm;
  updateNewEntry: (draft: EntryForm) => void;
  updateFollowUpDraft: (entryId: string, draft: EntryForm) => void;
  updateSupersedingDraft: (entryId: string, draft: EntryForm) => void;
}

const DEFAULT_DRAFT: EntryForm = {
  title: "",
  text: "",
  logbook: "",
  attachments: [],
  tags: [],
};

export const useDraftsStore = create(
  persist<DraftsState>(
    (set, get) => ({
      newEntry: {
        ...DEFAULT_DRAFT,
      },
      followUps: {},
      supersedes: {},
      getOrCreateFollowUpDraft(entry) {
        return (
          get().followUps[entry.id] || {
            ...DEFAULT_DRAFT,
            logbook: entry.logbook,
          }
        );
      },
      getOrCreateSupersedingDraft(entry) {
        return get().supersedes[entry.id] || { ...entry };
      },
      updateNewEntry(draft) {
        set({ newEntry: draft });
      },
      updateFollowUpDraft(entryId, draft) {
        set((state) => ({
          followUps: { ...state.followUps, [entryId]: draft },
        }));
      },
      updateSupersedingDraft(entryId, draft) {
        set((state) => ({
          supersedes: { ...state.supersedes, [entryId]: draft },
        }));
      },
    }),
    {
      name: "draft-store",
    }
  )
);