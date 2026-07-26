"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore }
from "@/store/authStore";

type Props = {

  children: React.ReactNode;

  allowedRoles?: string[];
};

export default function ProtectedRoute({

  children,
  allowedRoles = []

}: Props) {

  const router = useRouter();

  const { user, token } =
    useAuthStore();

  useEffect(() => {

    // NOT LOGGED IN
    if (!token || !user) {

      router.push("/login");

      return;
    }

    // ROLE NOT ALLOWED
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {

      router.push("/login");
    }

  }, [token, user, router, allowedRoles]);

  // WAIT
  if (!token || !user) {

    return null;
  }

  // BLOCK WRONG ROLE
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {

    return null;
  }

  return children;
}