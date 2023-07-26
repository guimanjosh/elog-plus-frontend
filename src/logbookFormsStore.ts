import { create } from "zustand";
import { Logbook, Shift, Tag } from "./api";

interface LogbookForm extends Omit<Logbook, "tags" | "shifts"> {
  tags: (Omit<Tag, "id"> & { id?: string })[];
  shifts: (Partial<Shift> & { id: string; name: string })[];
}

interface LogbookFormsState {
  forms: Record<string, LogbookForm>;
  startEditing: (
    logbook: Logbook
  ) => [LogbookForm, (newValue: LogbookForm) => void];
  upsertForm: (newValue: LogbookForm) => void;
}

export const useLogbookFormsStore = create<LogbookFormsState>((set, get) => ({
  forms: {},
  startEditing(logbook) {
    const state = get();
    const form = state.forms[logbook.id] || logbook;

    return [form, state.upsertForm];
  },
  upsertForm(newValue: LogbookForm) {
    set(({ forms }) => ({
      forms: {
        ...forms,
        [newValue.id]: newValue,
      },
    }));
  },
}));
