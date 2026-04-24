import { create } from "zustand";

const STORAGE_KEY = "rentalps-cashier-auth";

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return { token: null, user: null };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      token: parsedValue.token || null,
      user: parsedValue.user || null,
    };
  } catch {
    return { token: null, user: null };
  }
}

const initialAuth = getStoredAuth();

const useAuthStore = create((set) => ({
  token: initialAuth.token,
  user: initialAuth.user,
  setAuth: ({ token, user }) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },
  clearAuth: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
