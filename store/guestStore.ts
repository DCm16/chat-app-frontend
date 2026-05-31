import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";

interface GuestState {
  guestToken: string | null;
  conversationId: string | null;
  guestUsername: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  setGuest: (token: string, conversationId: string, username: string) => void;
  clearGuest: () => void;
  isGuest: () => boolean;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guestToken: null,
      conversationId: null,
      guestUsername: null,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setGuest: (token, conversationId, username) => {
        Cookies.set("guest_token", token, { expires: 7 });
        set({ guestToken: token, conversationId, guestUsername: username });
      },
      clearGuest: () => {
        Cookies.remove("guest_token");
        set({ guestToken: null, conversationId: null, guestUsername: null });
      },
      isGuest: () => !!get().guestToken,
    }),
    {
      name: "guest-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        guestToken: s.guestToken,
        conversationId: s.conversationId,
        guestUsername: s.guestUsername,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark hydration complete after rehydration
        state?.setHasHydrated(true);
      },
    },
  ),
);
