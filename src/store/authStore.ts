"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {

  id: string;

  firstName: string;

  lastName: string;

  email: string;

  role: string;

  hospitalId: string;
}

interface AuthState {

  token: string | null;

  user: User | null;

  loading: boolean;

  hydrated: boolean;

  setAuth: (
    token: string,
    user: User
  ) => void;

  login: (
    token: string,
    user: User
  ) => void;

  logout: () => void;

  setLoading: (
    loading: boolean
  ) => void;

  setHydrated: () => void;
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({

        token: null,

        user: null,

        loading: false,

        hydrated: false,

        setAuth: (
          token,
          user
        ) => {

          set({
            token,
            user
          });
        },

        login: (
          token,
          user
        ) => {

          set({
            token,
            user
          });
        },

        logout: () => {

          set({
            token: null,
            user: null
          });
        },

        setLoading: (
          loading
        ) =>

          set({
            loading
          }),

        setHydrated: () =>

          set({
            hydrated: true
          })

      }),
      {
        name: "auth-storage",

        onRehydrateStorage:
          () => (state) => {

            state?.setHydrated();
          }
      }
    )
  );