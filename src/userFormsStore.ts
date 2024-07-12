import { create } from 'zustand';
import { UserLogbookAuthorization, User } from './api';


interface UserForm {
  mail: string;
  authorizations: UserLogbookAuthorization[];
}

interface UserFormsState {
  forms: Record<string, UserForm>;
  startEditing: (
    // mail: string
    user: User
  ) => [UserForm, (newValue: UserForm) => void, () => void];
  removeForm: (userID: string) => void; 
  upsertForm: (newValue: UserForm) => void; 
}

export const useUserFormsStore = create<UserFormsState>((set, get) => ({
  forms: {},
  startEditing(user) {
    const state = get();
    // const form = state.forms[mail] || { mail, authorizations: [] };
    const form = state.forms[user.uid] || { user, authorizations: [] };

    return [
      form,
      (newValue: UserForm) => {
        if (JSON.stringify(newValue) === JSON.stringify(state.forms[mail])) {
          state.removeForm(user.uid);
        } else {
          state.upsertForm(newValue);
        }
      },
      () => state.removeForm(user.uid),
    ];
  },
  upsertForm(newValue: UserForm) {
    set(({ forms }) => ({
      forms: {
        ...forms,
        [newValue.mail]: newValue,
      },
    }));
  },
  removeForm(mail) {
    set(({ forms }) => {
      const { [mail]: removed, ...rest } = forms; 

      return { forms: rest };
    });
  },
}));
