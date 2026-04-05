"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MonitorPlay,
  RefreshCw,
  ImageIcon,
  ExternalLink,
  Check,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { getYouTubeVideos, updateVideoThumbnail, getHistory } from "@/lib/api";
import type { YouTubeVideo } from "@/types/api";
import styles from "./page.module.css";

export default function YouTubePage() {
  const queryClient = useQueryClient();
  const [replaceTarget, setReplaceTarget] = useState<YouTubeVideo | null>(null);
  const [selectedJobId, setSelectedJobId] = useState("");

  const { data: videosData, isLoading } = useQuery({
    queryKey: ["youtubeVideos"],
    queryFn: getYouTubeVideos,
  });

  const { data: historyData } = useQuery({
    queryKey: ["history", { limit: 50, offset: 0 }],
    queryFn: () => getHistory(50, 0),
    enabled: replaceTarget !== null,
  });

  const replaceMutation = useMutation({
    mutationFn: () => {
      if (!replaceTarget) throw new Error("No target");
      return updateVideoThumbnail(replaceTarget.videoId, selectedJobId);
    },
    onSuccess: () => {
      toast.success("サムネイルを更新しました");
      setReplaceTarget(null);
      setSelectedJobId("");
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] });
    },
    onError: () => {
      toast.error("サムネイルの更新に失敗しました");
    },
  });

  const videos = videosData?.videos || [];
  const completedJobs = (historyData?.jobs || []).filter(
    (j) => j.status === "completed",
  );

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <MonitorPlay size={24} className={styles.headerIcon} />
            <div>
              <h1 className={styles.title}>YouTube管理</h1>
              <p className={styles.subtitle}>動画のサムネイルを直接更新する</p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} padding="md">
                <div className={styles.videoRow}>
                  <Skeleton width={160} height={90} />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Skeleton height={16} width="80%" />
                    <Skeleton height={12} width="40%" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className={styles.list}>
            {videos.map((video) => (
              <Card key={video.videoId} padding="none">
                <div className={styles.videoRow}>
                  <div className={styles.videoThumb}>
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className={styles.videoImg}
                      />
                    ) : (
                      <div className={styles.noThumb}>
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className={styles.videoInfo}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <time className={styles.videoDate}>
                      {new Date(video.publishedAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <div className={styles.videoActions}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReplaceTarget(video)}
                    >
                      <RefreshCw size={14} />
                      サムネイル差し替え
                    </Button>
                    <a
                      href={`https://youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.extLink}
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={MonitorPlay}
              title="動画が見つかりません"
              description="YouTubeチャンネルに動画をアップロードしてください"
            />
          </Card>
        )}

        <Modal
          open={replaceTarget !== null}
          onClose={() => {
            setReplaceTarget(null);
            setSelectedJobId("");
          }}
          title="サムネイルを差し替え"
        >
          {replaceTarget && (
            <div className={styles.replaceForm}>
              <p className={styles.replaceTarget}>
                対象: <strong>{replaceTarget.title}</strong>
              </p>

              <div className={styles.jobList}>
                <p className={styles.jobListLabel}>適用するサムネイルを選択:</p>
                {completedJobs.length > 0 ? (
                  <div className={styles.jobGrid}>
                    {completedJobs.slice(0, 12).map((job) => (
                      <button
                        key={job.id}
                        className={`${styles.jobOption} ${selectedJobId === job.id ? styles.jobOptionSelected : ""}`}
                        onClick={() => setSelectedJobId(job.id)}
                      >
                        <div className={styles.jobOptionThumb}>
                          <ImageIcon size={16} />
                        </div>
                        <span className={styles.jobOptionPrompt}>
                          {job.prompt}
                        </span>
                        {selectedJobId === job.id && (
                          <Check size={14} className={styles.checkIcon} />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noJobs}>
                    完了済みの生成ジョブがありません
                  </p>
                )}
              </div>

              <div className={styles.replaceActions}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setReplaceTarget(null);
                    setSelectedJobId("");
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  loading={replaceMutation.isPending}
                  disabled={!selectedJobId}
                  onClick={() => replaceMutation.mutate()}
                >
                  <RefreshCw size={16} />
                  差し替え実行
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
