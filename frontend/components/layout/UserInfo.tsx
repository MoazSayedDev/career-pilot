"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "@/services/auth/api/auth.service";
import { getProfile } from "@/services/profile/api/profile.service";

interface UserInfo {
  /** Preferred name from the profile, falling back to the account username. */
  name: string;

  /** Profile headline, empty when not set. */
  headline: string;

  /** Up to two uppercase initials for the avatar. */
  initials: string;

  loading: boolean;
}

const UserInfoContext = createContext<UserInfo>({
  name: "",
  headline: "",
  initials: "",
  loading: true,
});

export function UserInfoProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<UserInfo>({
    name: "",
    headline: "",
    initials: "",
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let firstName = "";
      let lastName = "";
      let headline = "";

      try {
        const profile = await getProfile();

        firstName = profile?.firstName ?? "";
        lastName = profile?.lastName ?? "";
        headline = profile?.headline ?? "";
      } catch {
        // No profile yet (or request failed): fall back to the username.
        try {
          const me = await getCurrentUser();

          firstName = me?.data?.username ?? "";
        } catch {
          // Unauthenticated or offline — stay blank.
        }
      }

      if (cancelled) return;

      const name = `${firstName} ${lastName}`.trim();

      const initials = (
        (firstName[0] ?? "") + (lastName[0] ?? "")
      ).toUpperCase();

      setInfo({ name, headline, initials, loading: false });
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UserInfoContext.Provider value={info}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  return useContext(UserInfoContext);
}
