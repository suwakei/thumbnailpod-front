"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Layers,
  ImageIcon,
  Loader2,
  Copy,
  FileArchive,
  FileImage,
  Pencil,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Skeleton from "@/components/ui/Skeleton";
import { getJobStatus, segmentJob, getLayers, getDownloadURL } from "@/lib/api";
import {
  ROUTES,
  JOB_STATUS,
  JOB_POLLING_INTERVAL_MS,
  DATE_LOCALE,
  DOWNLOAD_FORMAT,
} from "@/consts";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { jobId } = use(params);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"preview" | "layers">("preview");

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobStatus(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === JOB_STATUS.pending || status === JOB_STATUS.processing
        ? JOB_POLLING_INTERVAL_MS
        : false;
    },
  });

  const { data: layersData } = useQuery({
    queryKey: ["layers", jobId],
    queryFn: () => getLayers(jobId),
    enabled: job?.status === JOB_STATUS.completed,
  });

  const segmentMutation = useMutation({
    mutationFn: () => segmentJob(jobId),
    onSuccess: () => {
      toast.success("レイヤー分離が完了しました");
      queryClient.invalidateQueries({ queryKey: ["layers", jobId] });
    },
    onError: () => {
      toast.error("レイヤー分離に失敗しました");
    },
  });

  async function handleDownload(format: string, layer?: string) {
    if (!job?.thumbnailId) return;
    try {
      const { downloadUrl } = await getDownloadURL(
        job.thumbnailId,
        format,
        layer,
      );
      window.open(downloadUrl, "_blank");
    } catch {
      toast.error("ダウンロードに失敗しました");
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <Skeleton height={32} width={200} />
          <Skeleton height={400} />
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className={styles.page}>
          <p className={styles.notFound}>ジョブが見つかりません</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link href={ROUTES.history} className={styles.back}>
            <ArrowLeft size={16} />
            履歴に戻る
          </Link>
          <StatusBadge status={job.status} />
        </div>

        <div className={styles.layout}>
          <div className={styles.previewArea}>
            <div className={styles.tabs}>
              <button
                className={
                  activeTab === "preview" ? styles.tabActive : styles.tab
                }
                onClick={() => setActiveTab("preview")}
              >
                <ImageIcon size={14} />
                プレビュー
              </button>
              <button
                className={
                  activeTab === "layers" ? styles.tabActive : styles.tab
                }
                onClick={() => setActiveTab("layers")}
              >
                <Layers size={14} />
                レイヤー
              </button>
            </div>

            {activeTab === "preview" ? (
              <Card padding="none">
                <div className={styles.preview}>
                  {job.status === JOB_STATUS.completed && job.imageUrl ? (
                    <img
                      src={job.imageUrl}
                      alt="Generated thumbnail"
                      className={styles.previewImg}
                    />
                  ) : job.status === JOB_STATUS.processing ? (
                    <div className={styles.previewLoading}>
                      <Loader2 size={32} className={styles.spin} />
                      <p>生成中...</p>
                    </div>
                  ) : job.status === JOB_STATUS.failed ? (
                    <div className={styles.previewError}>
                      <p>生成に失敗しました</p>
                      {job.error && (
                        <p className={styles.errorDetail}>{job.error}</p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.previewPending}>
                      <ImageIcon size={32} />
                      <p>処理待ち</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card padding="md">
                {layersData?.layers && layersData.layers.length > 0 ? (
                  <div className={styles.layerGrid}>
                    {layersData.layers.map((layer) => (
                      <div key={layer.label} className={styles.layerItem}>
                        <div className={styles.layerThumb}>
                          <img src={layer.url} alt={layer.label} />
                        </div>
                        <div className={styles.layerInfo}>
                          <span className={styles.layerLabel}>
                            {layer.label}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload("png", layer.label)}
                          >
                            <Download size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noLayers}>
                    <p>レイヤーデータがありません</p>
                    {job.status === JOB_STATUS.completed && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={segmentMutation.isPending}
                        onClick={() => segmentMutation.mutate()}
                      >
                        <Layers size={14} />
                        レイヤー分離を実行
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className={styles.sidebar}>
            <Card padding="md">
              <h3 className={styles.sideTitle}>プロンプト</h3>
              <p className={styles.promptText}>{job.prompt}</p>
              <button
                className={styles.copyBtn}
                onClick={() => {
                  navigator.clipboard.writeText(job.prompt);
                  toast.success("コピーしました");
                }}
              >
                <Copy size={14} />
                コピー
              </button>
            </Card>

            <Card padding="md">
              <h3 className={styles.sideTitle}>情報</h3>
              <dl className={styles.detailList}>
                <div className={styles.detailRow}>
                  <dt>ジョブID</dt>
                  <dd className={styles.mono}>{job.jobId.slice(0, 8)}...</dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>作成日</dt>
                  <dd>
                    {new Date(job.createdAt).toLocaleDateString(DATE_LOCALE, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div className={styles.detailRow}>
                  <dt>ステータス</dt>
                  <dd>
                    <StatusBadge status={job.status} />
                  </dd>
                </div>
              </dl>
            </Card>

            {job.status === JOB_STATUS.completed && (
              <Card padding="md">
                <h3 className={styles.sideTitle}>編集</h3>
                <Link href={ROUTES.editor(jobId)}>
                  <Button variant="primary" size="sm">
                    <Pencil size={14} />
                    エディタで編集
                  </Button>
                </Link>
              </Card>
            )}

            {job.status === JOB_STATUS.completed && job.thumbnailId && (
              <Card padding="md">
                <h3 className={styles.sideTitle}>ダウンロード</h3>
                <div className={styles.downloadActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(DOWNLOAD_FORMAT.png)}
                  >
                    <FileImage size={14} />
                    PNG
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(DOWNLOAD_FORMAT.psd)}
                  >
                    <FileImage size={14} />
                    PSD
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(DOWNLOAD_FORMAT.zip)}
                  >
                    <FileArchive size={14} />
                    ZIP
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
