"use client";

import { useEffect } from "react";

import { useRouter }
from "next/navigation";

import { useAuthStore }
from "@/store/authStore";

type Props = {

  children: React.ReactNode;

  allowedRoles: string[];
};

export default function RoleGuard({

  children,
  allowedRoles

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

    // WRONG ROLE
    if (
      !allowedRoles.includes(user.role)
    ) {

      router.push("/login");
    }

  }, [user, token, router, allowedRoles]);

  if (!token || !user) {

    return null;
  }

  if (
    !allowedRoles.includes(user.role)
  ) {

    return null;
  }

  return children;
}