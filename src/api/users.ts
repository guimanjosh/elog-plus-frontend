import { create } from 'zustand';
import { fetch } from ".";
import {User} from "../api"
import { AuthorizationType, LogbookWithAuth } from './logbooks';


// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   permissions: AuthorizationType[];
// }


export interface UserWithAuth{
  logbook: string;
  authorizationType: AuthorizationType;
}

// export interface UserWithAuth extends User {
//   authorizations: UserLogbookAuthorization[];
// }


export async function createUserAuth(userID: string, logbookID: string | null, authorizationType: string) {
  return await fetch(`v1/logbooks/auth/user`, {
    method: "POST",
    body: { userID, logbookID, authorizationType },
  });
}

export async function updateUserAuth(userID: string, logbookID: string, authorizationType: string) {
  return await fetch(`v1/logbook/auth/user/${userID}`, {
      method: "PUT",
      body: {
        logbookID : logbookID,
        authorizationType
      }
    });
  }

export async function removeUserAuth( user : User, logbook : LogbookWithAuth){
    return await fetch(`v1/logbook/auth/user/${user.uid}`, {
      method: "DELETE",
    })
}

// interface UsersState {
//   users: Record<string, User>;
   
//   addUserAuth: (user: User) => void; 
//   removeUser: (userId: string) => void; 
//   updateUserPermissions: (userId: string, permissions: AuthorizationType[]) => void;
// }

// export interface UserFormsState{
//   users: Record<string, User>;
//   addUserAuth: (user: User) => void; 
//   removeUser: (userId: string) => void; 
//   updateUserPermissions: (userId: string, permissions: AuthorizationType[]) => void;
// }

// export const useUsersStore = create<UserFormsState>((set, get) => ({
//   users: {},
//   addUserAuth(user) {
//     set(state => ({
//       users: {
//         ...state.users,
//         [user.uid]: user,
//       },
//     }));
//   },
//   removeUser(userId) {
//     set(state => {
//       const { [userId]: removedUser, ...restUsers } = state.users;
//       return { users: restUsers };
//     });
//   },
//   updateUserPermissions(userId : string, permissions) {
//     set(state => {
//       if (!state.users[userId]) return state;

//       const updatedUser = {
//         ...state.users[userId],
//         permissions: [...permissions],
//       };

//       return {
//         users: {
//           ...state.users,
//           [userId]: updatedUser,
//         },
//       };
//     });
//   },
// }));
