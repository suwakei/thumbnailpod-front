"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Heart, HeartOff, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { getFavorites, removeFavorite } from "@/lib/api";
import { ROUTES, PAGE_SIZE, JOB_STATUS, DATE_LOCALE } from "@/consts";
import styles from "./page.module.css";

const FAVORITES_PAGE_SIZE: number = PAGE_SIZE.historyGrid;

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(FAVORITES_PAGE_SIZE);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", { limit: displayCount, offset: 0 }],
    queryFn: () => getFavorites(displayCount, 0),
  });

  const removeMutation = useMutation({
    mutationFn: (jobId: string) => removeFavorite(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("お気に入りを解除しました");
    },
    onError: () => {
      toast.error("お気に入りの解除に失敗しました");
    },
  });

  const hasMore = data ? displayCount < data.totalCount : false;

  const handleRemove = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeMutation.mutate(jobId);
  };

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>お気に入り</h1>
          <p className={styles.subtitle}>
            {data ? `${data.totalCount} 件` : "読み込み中..."}
          </p>
        </header>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: FAVORITES_PAGE_SIZE }).map((_, i) => (
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
        ) : data && data.favorites.length > 0 ? (
          <>
            <div className={styles.grid}>
              {data.favorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={ROUTES.historyDetail(fav.jobId)}
                  className={styles.cardLink}
                >
                  <Card variant="interactive" padding="none">
                    <div className={styles.cardInner}>
                      <button
                        className={styles.removeBtn}
                        onClick={(e) => handleRemove(e, fav.jobId)}
                        aria-label="お気に入りを解除"
                      >
                        <HeartOff size={16} />
                      </button>
                      <div className={styles.thumb}>
                        {fav.job?.status === JOB_STATUS.processing ? (
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
                        <p className={styles.prompt}>
                          {fav.job?.prompt ?? "---"}
                        </p>
                        <div className={styles.meta}>
                          {fav.job && <StatusBadge status={fav.job.status} />}
                          <time className={styles.date}>
                            {new Date(fav.createdAt).toLocaleDateString(
                              DATE_LOCALE,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setDisplayCount((c) => c + FAVORITES_PAGE_SIZE)
                  }
                >
                  もっと見る
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <EmptyState
              icon={Heart}
              title="お気に入りがまだありません"
              description="生成履歴からサムネイルをお気に入りに追加してみましょう"
            >
              <Link href={ROUTES.history}>
                <Button>生成履歴へ</Button>
              </Link>
            </EmptyState>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
