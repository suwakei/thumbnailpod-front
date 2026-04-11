"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import styles from "./AppShell.module.css";
import { getMe } from "@/lib/api";
import { ROUTES } from "@/consts";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;
    if (!user || isError) {
      router.replace(ROUTES.login);
    }
  }, [user, isLoading, isError, router]);

  if (isLoading || !user) {
    return (
      <div className={styles.shell}>
        <div className={styles.loadingScreen}>
          <Loader2 size={32} className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        channelName={user.channelName}
        plan={user.plan}
        role={user.role}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
