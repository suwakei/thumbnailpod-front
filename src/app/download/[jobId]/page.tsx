'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileImage,
  FileArchive,
  Layers,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  getJobStatus,
  getLayers,
  getDownloadURL,
  segmentJob,
} from '@/lib/api';
import { ROUTES, JOB_STATUS, DOWNLOAD_FORMAT } from '@/consts';
import styles from './page.module.css';

type DownloadFormat = 'png' | 'psd' | 'zip';

interface FormatOption {
  value: DownloadFormat;
  label: string;
  description: string;
  icon: typeof FileImage;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'png',
    label: 'PNG',
    description: '合成済み画像 (最終出力)',
    icon: FileImage,
  },
  {
    value: 'psd',
    label: 'PSD',
    description: 'レイヤー付きファイル (編集用)',
    icon: FileImage,
  },
  {
    value: 'zip',
    label: 'ZIP',
    description: '全レイヤー一括 (個別PNG)',
    icon: FileArchive,
  },
];

const FORMAT_DETAILS: Record<DownloadFormat, string> = {
  png: '全レイヤーを合成した最終出力画像です。そのままYouTubeにアップロードできます。',
  psd: 'Photoshop形式のファイルです。各レイヤーが保持されており、後から自由に編集できます。',
  zip: '全レイヤーを個別のPNGファイルとしてZIPにまとめたものです。各レイヤーを個別に利用できます。',
};

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function DownloadPage({ params }: PageProps) {
  const { jobId } = use(params);
  const queryClient = useQueryClient();
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('png');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobStatus(jobId),
  });

  const { data: layersData } = useQuery({
    queryKey: ['layers', jobId],
    queryFn: () => getLayers(jobId),
    enabled: job?.status === JOB_STATUS.completed,
  });

  const segmentMutation = useMutation({
    mutationFn: () => segmentJob(jobId),
    onSuccess: () => {
      toast.success('レイヤー分離が完了しました');
      queryClient.invalidateQueries({ queryKey: ['layers', jobId] });
    },
    onError: () => {
      toast.error('レイヤー分離に失敗しました');
    },
  });

  async function handleDownload(format: string, layer?: string) {
    if (!job?.thumbnailId) return;
    setIsDownloading(true);
    try {
      const { downloadUrl } = await getDownloadURL(
        job.thumbnailId,
        format,
        layer,
      );
      window.open(downloadUrl, '_blank');
    } catch {
      toast.error('ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleLayerDownload(layerLabel: string) {
    if (!job?.thumbnailId) return;
    try {
      const { downloadUrl } = await getDownloadURL(
        job.thumbnailId,
        'png',
        layerLabel,
      );
      window.open(downloadUrl, '_blank');
    } catch {
      toast.error('ダウンロードに失敗しました');
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <Skeleton height={32} width={200} />
          <div className={styles.layout}>
            <div>
              <Skeleton height={400} />
            </div>
            <div className={styles.sidebar}>
              <Skeleton height={300} />
            </div>
          </div>
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

  const hasLayers = layersData?.layers && layersData.layers.length > 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link href={ROUTES.historyDetail(jobId)} className={styles.back}>
            <ArrowLeft size={16} />
            詳細に戻る
          </Link>
          <StatusBadge status={job.status} />
        </div>

        <div className={styles.layout}>
          {/* Main area: layer preview grid */}
          <div className={styles.mainArea}>
            {/* Composite image */}
            {job.status === JOB_STATUS.completed && job.imageUrl && (
              <Card padding="none">
                <div className={styles.compositeWrapper}>
                  <img
                    src={job.imageUrl}
                    alt="Composite thumbnail"
                    className={styles.compositeImg}
                  />
                  <span className={styles.compositeLabel}>
                    <CheckCircle size={14} />
                    Composite
                  </span>
                </div>
              </Card>
            )}

            {/* Layer grid */}
            {hasLayers ? (
              <div className={styles.layerSection}>
                <h3 className={styles.sectionTitle}>
                  <Layers size={16} />
                  レイヤー
                </h3>
                <div className={styles.layerGrid}>
                  {layersData.layers.map((layer) => (
                    <div key={layer.label} className={styles.layerCard}>
                      <div className={styles.layerThumb}>
                        <img src={layer.url} alt={layer.label} />
                      </div>
                      <div className={styles.layerInfo}>
                        <span className={styles.layerLabel}>
                          {layer.label}
                        </span>
                        <button
                          className={styles.layerDownloadBtn}
                          onClick={() => handleLayerDownload(layer.label)}
                          title={`${layer.label} をダウンロード`}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : job.status === JOB_STATUS.completed ? (
              <Card padding="lg">
                <EmptyState
                  icon={Layers}
                  title="レイヤーデータがありません"
                  description="レイヤー分離を実行すると、個別のレイヤーをプレビュー・ダウンロードできます。"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    loading={segmentMutation.isPending}
                    onClick={() => segmentMutation.mutate()}
                  >
                    <Layers size={14} />
                    レイヤー分離を実行
                  </Button>
                </EmptyState>
              </Card>
            ) : null}
          </div>

          {/* Sidebar: download options */}
          <div className={styles.sidebar}>
            {/* Format selection */}
            <Card padding="md">
              <h3 className={styles.sideTitle}>フォーマット選択</h3>
              <div className={styles.formatList}>
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedFormat === opt.value;
                  return (
                    <button
                      key={opt.value}
                      className={
                        isSelected
                          ? styles.formatOptionSelected
                          : styles.formatOption
                      }
                      onClick={() => setSelectedFormat(opt.value)}
                    >
                      <Icon size={20} className={styles.formatIcon} />
                      <div className={styles.formatText}>
                        <span className={styles.formatName}>{opt.label}</span>
                        <span className={styles.formatDesc}>
                          {opt.description}
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle
                          size={16}
                          className={styles.formatCheck}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className={styles.formatDetail}>
                {FORMAT_DETAILS[selectedFormat]}
              </p>

              <Button
                variant="primary"
                size="lg"
                loading={isDownloading}
                onClick={() => handleDownload(selectedFormat)}
              >
                <Download size={16} />
                ダウンロード
              </Button>
            </Card>

            {/* Layer individual downloads */}
            {hasLayers && (
              <Card padding="md">
                <h3 className={styles.sideTitle}>レイヤー個別ダウンロード</h3>
                <div className={styles.layerDownloadList}>
                  {layersData.layers.map((layer) => (
                    <div key={layer.label} className={styles.layerDownloadRow}>
                      <span className={styles.layerDownloadLabel}>
                        {layer.label}
                      </span>
                      <button
                        className={styles.layerDownloadIconBtn}
                        onClick={() => handleLayerDownload(layer.label)}
                        title={`${layer.label} をダウンロード`}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
