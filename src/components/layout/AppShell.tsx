"use client";

import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import styles from "./AppShell.module.css";
import { getMe } from "@/lib/api";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
  });

  return (
    <div className={styles.shell}>
      <Sidebar channelName={user?.channelName} plan={user?.plan} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
