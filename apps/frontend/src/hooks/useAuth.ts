"use client";

import { useClerk, useUser } from "@clerk/nextjs";

export function useAuth() {
  const { signOut } = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
  };
}
