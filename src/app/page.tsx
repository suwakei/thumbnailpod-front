"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  Clock,
  ImageIcon,
  ArrowRight,
  Loader2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ImageUploader from "@/components/features/ImageUploader";
import type { UploadedImage } from "@/components/features/ImageUploader";
import {
  createGenerationJob,
  getHistory,
  getStyleModels,
  getMyPlan,
} from "@/lib/api";
import { uploadFiles } from "@/lib/upload";
import {
  ROUTES,
  PAGE_SIZE,
  JOB_STATUS,
  STYLE_MODEL_STATUS,
  DATE_LOCALE,
} from "@/consts";
import styles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [styleModelId, setStyleModelId] = useState("");
  const [refImages, setRefImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lastGeneratedJobId, setLastGeneratedJobId] = useState<string | null>(
    null,
  );

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["history", { limit: PAGE_SIZE.dashboardRecent, offset: 0 }],
    queryFn: () => getHistory(PAGE_SIZE.dashboardRecent, 0),
  });

  const { data: modelsData } = useQuery({
    queryKey: ["styleModels"],
    queryFn: getStyleModels,
  });

  const { data: planInfo } = useQuery({
    queryKey: ["myPlan"],
    queryFn: getMyPlan,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      let imageKeys: string[] | undefined;

      // Upload reference images first
      if (refImages.length > 0) {
        setIsUploading(true);
        try {
          const pendingFiles = refImages
            .filter((img) => img.status !== "done")
            .map((img) => img.file);
          const alreadyUploaded = refImages
            .filter((img) => img.status === "done" && img.s3Key)
            .map((img) => img.s3Key as string);

          if (pendingFiles.length > 0) {
            const results = await uploadFiles(pendingFiles, (index, status) => {
              setRefImages((prev) => {
                const pending = prev.filter((img) => img.status !== "done");
                if (pending[index]) {
                  return prev.map((img) =>
                    img.id === pending[index].id ? { ...img, status } : img,
                  );
                }
                return prev;
              });
            });
            imageKeys = [...alreadyUploaded, ...results.map((r) => r.s3Key)];
          } else {
            imageKeys = alreadyUploaded;
          }
        } finally {
          setIsUploading(false);
        }
      }

      return createGenerationJob(prompt, styleModelId || undefined, imageKeys);
    },
    onSuccess: (data) => {
      setLastGeneratedJobId(data.jobId);
      toast.success("サムネイル生成を開始しました", {
        action: {
          label: "エディタで開く",
          onClick: () => router.push(ROUTES.editor(data.jobId)),
        },
      });
      setPrompt("");
      setRefImages([]);
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: () => {
      toast.error("生成に失敗しました");
    },
  });

  const handleImagesChange = useCallback((images: UploadedImage[]) => {
    setRefImages(images);
  }, []);

  const readyModels = (modelsData?.models || []).filter(
    (m) => m.status === STYLE_MODEL_STATUS.ready,
  );

  const styleOptions = [
    { value: "", label: "スタイルモデルなし" },
    ...readyModels.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>サムネイルを生成して管理する</p>
          </div>
          {planInfo && (
            <div className={styles.quota}>
              <span className={styles.quotaLabel}>今月の生成</span>
              <span className={styles.quotaValue}>
                {planInfo.generationCountMonth}
                <span className={styles.quotaMax}>
                  {" "}
                  / {planInfo.monthlyLimit}
                </span>
              </span>
            </div>
          )}
        </header>

        <Card variant="highlighted" padding="lg">
          <div className={styles.generateForm}>
            <div className={styles.formHeader}>
              <Sparkles size={20} className={styles.formIcon} />
              <h2 className={styles.formTitle}>新しいサムネイルを生成</h2>
            </div>
            <Textarea
              placeholder="サムネイルの内容を説明してください... 例: 「衝撃のニュース！赤い背景に驚く表情の人物、大きな白文字タイトル」"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
            <ImageUploader
              images={refImages}
              onImagesChange={handleImagesChange}
              maxFiles={5}
              disabled={generateMutation.isPending}
            />
            <div className={styles.formActions}>
              <Select
                options={styleOptions}
                value={styleModelId}
                onChange={(e) => setStyleModelId(e.target.value)}
              />
              <Button
                onClick={() => generateMutation.mutate()}
                loading={generateMutation.isPending}
                disabled={!prompt.trim()}
              >
                <Sparkles size={16} />
                {isUploading ? "アップロード中..." : "生成する"}
              </Button>
            </div>
          </div>
        </Card>

        {lastGeneratedJobId && (
          <div className={styles.generatedBanner}>
            <div className={styles.bannerContent}>
              <Sparkles size={16} className={styles.bannerIcon} />
              <div>
                <p className={styles.bannerTitle}>
                  サムネイルを生成しました！
                </p>
                <p className={styles.bannerDesc}>
                  気に入らなかったらすぐ編集できます
                </p>
              </div>
            </div>
            <div className={styles.bannerActions}>
              <Link href={ROUTES.historyDetail(lastGeneratedJobId)}>
                <Button variant="ghost" size="sm">
                  <ImageIcon size={14} />
                  詳細を見る
                </Button>
              </Link>
              <Link href={ROUTES.editor(lastGeneratedJobId)}>
                <Button variant="primary" size="sm">
                  <Pencil size={14} />
                  エディタで編集
                </Button>
              </Link>
            </div>
          </div>
        )}

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Clock size={18} />
              最近の生成
            </h2>
            <Link href={ROUTES.history} className={styles.viewAll}>
              すべて見る
              <ArrowRight size={14} />
            </Link>
          </div>

          {historyLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: PAGE_SIZE.dashboardRecent }).map((_, i) => (
                <Card key={i} padding="none">
                  <Skeleton height={160} borderRadius="0" />
                  <div
                    style={{
                      padding: "16px",
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
          ) : history && history.jobs.length > 0 ? (
            <div className={styles.grid}>
              {history.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={ROUTES.historyDetail(job.id)}
                  className={styles.jobCardLink}
                >
                  <Card variant="interactive" padding="none">
                    <div className={styles.jobThumb}>
                      {job.status === JOB_STATUS.completed ? (
                        <div className={styles.thumbPlaceholder}>
                          <ImageIcon size={24} />
                        </div>
                      ) : job.status === JOB_STATUS.processing ? (
                        <div className={styles.thumbProcessing}>
                          <Loader2 size={24} className={styles.spinIcon} />
                        </div>
                      ) : (
                        <div className={styles.thumbPlaceholder}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.jobInfo}>
                      <p className={styles.jobPrompt}>{job.prompt}</p>
                      <div className={styles.jobMeta}>
                        <StatusBadge status={job.status} />
                        <span className={styles.jobDate}>
                          {new Date(job.createdAt).toLocaleDateString(
                            DATE_LOCALE,
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={ImageIcon}
                title="まだ生成履歴がありません"
                description="上のフォームからサムネイルを生成してみましょう"
              />
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
