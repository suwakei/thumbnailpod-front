"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Clock,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getHistory } from "@/lib/api";
import styles from "./page.module.css";

const PAGE_SIZE = 12;

export default function HistoryPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["history", { limit: PAGE_SIZE, offset: page * PAGE_SIZE }],
    queryFn: () => getHistory(PAGE_SIZE, page * PAGE_SIZE),
  });

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>生成履歴</h1>
          <p className={styles.subtitle}>
            {data ? `${data.totalCount} 件` : "読み込み中..."}
          </p>
        </header>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Card key={i} padding="none">
                <Skeleton height={160} borderRadius="0" />
                <div
                  style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <Skeleton height={14} width="70%" />
                  <Skeleton height={12} width="40%" />
                </div>
              </Card>
            ))}
          </div>
        ) : data && data.jobs.length > 0 ? (
          <>
            <div className={styles.grid}>
              {data.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/history/${job.id}`}
                  className={styles.cardLink}
                >
                  <Card variant="interactive" padding="none">
                    <div className={styles.thumb}>
                      {job.status === "processing" ? (
                        <div className={styles.thumbProcessing}>
                          <Loader2 size={24} className={styles.spin} />
                        </div>
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <p className={styles.prompt}>{job.prompt}</p>
                      <div className={styles.meta}>
                        <StatusBadge status={job.status} />
                        <time className={styles.date}>
                          {new Date(job.createdAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={16} />
                  前へ
                </Button>
                <span className={styles.pageInfo}>
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  次へ
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <EmptyState
              icon={Clock}
              title="生成履歴がありません"
              description="ダッシュボードからサムネイルを生成してみましょう"
            >
              <Link href="/">
                <Button>ダッシュボードへ</Button>
              </Link>
            </EmptyState>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
