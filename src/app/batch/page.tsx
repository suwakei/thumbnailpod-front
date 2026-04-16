'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { Layers, Plus, X, Loader2, Sparkles, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { createBatchJobs, getStyleModels, getJobStatus } from '@/lib/api';
import { ROUTES, JOB_STATUS, JOB_POLLING_INTERVAL_MS } from '@/consts';
import styles from './page.module.css';

interface PromptRow {
  prompt: string;
  styleModelId: string;
}

const MAX_PROMPTS = 10;

function createEmptyRow(): PromptRow {
  return { prompt: '', styleModelId: '' };
}

export default function BatchPage() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<PromptRow[]>([createEmptyRow()]);
  const [submittedJobIds, setSubmittedJobIds] = useState<string[]>([]);

  const { data: styleData } = useQuery({
    queryKey: ['styleModels'],
    queryFn: getStyleModels,
  });

  const styleModels = styleData?.models || [];
  const styleOptions = [
    { value: '', label: 'スタイルなし' },
    ...styleModels.map((m: { id: string; name: string }) => ({
      value: m.id,
      label: m.name,
    })),
  ];

  // Poll all submitted jobs
  const { data: jobStatuses } = useQuery({
    queryKey: ['batchJobs', submittedJobIds],
    queryFn: () => Promise.all(submittedJobIds.map((id) => getJobStatus(id))),
    enabled: submittedJobIds.length > 0,
    refetchInterval: (query) => {
      const jobs = query.state.data;
      if (!jobs) return JOB_POLLING_INTERVAL_MS;
      const hasPending = jobs.some(
        (j) => j.status === JOB_STATUS.pending || j.status === JOB_STATUS.processing,
      );
      return hasPending ? JOB_POLLING_INTERVAL_MS : false;
    },
  });

  const batchMutation = useMutation({
    mutationFn: (prompts: { prompt: string; styleModelId?: string }[]) =>
      createBatchJobs(prompts),
    onSuccess: (data) => {
      const ids = data.jobs.map((j) => j.jobId);
      setSubmittedJobIds(ids);
      toast.success(`${ids.length} 件のジョブを送信しました`);
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
    onError: () => {
      toast.error('バッチ生成の送信に失敗しました');
    },
  });

  function updateRow(index: number, field: keyof PromptRow, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    if (rows.length >= MAX_PROMPTS) return;
    setRows((prev) => [...prev, createEmptyRow()]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const prompts = rows.map((row) => ({
      prompt: row.prompt.trim(),
      styleModelId: row.styleModelId || undefined,
    }));
    batchMutation.mutate(prompts);
  }

  const hasEmptyPrompt = rows.some((row) => !row.prompt.trim());
  const canSubmit = !hasEmptyPrompt && !batchMutation.isPending;

  // Results progress
  const completedCount = jobStatuses?.filter((j) => j.status === JOB_STATUS.completed).length ?? 0;
  const totalCount = submittedJobIds.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <div className={styles.titleIcon}>
              <Layers size={20} />
            </div>
            <div>
              <h1 className={styles.title}>バッチ生成</h1>
              <p className={styles.subtitle}>
                複数のサムネイルを一括で生成
              </p>
            </div>
          </div>
        </header>

        {/* Input Form Section */}
        <Card padding="lg">
          <h2 className={styles.sectionTitle}>プロンプト入力</h2>
          <div className={styles.promptList}>
            {rows.map((row, index) => (
              <div key={index} className={styles.promptRow}>
                <div className={styles.promptRowNumber}>{index + 1}</div>
                <div className={styles.promptRowFields}>
                  <Textarea
                    placeholder="サムネイルの説明を入力..."
                    rows={2}
                    value={row.prompt}
                    onChange={(e) => updateRow(index, 'prompt', e.target.value)}
                  />
                  <Select
                    options={styleOptions}
                    value={row.styleModelId}
                    onChange={(e) => updateRow(index, 'styleModelId', e.target.value)}
                  />
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeRow(index)}
                    aria-label="プロンプトを削除"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className={styles.formFooter}>
            <Button
              variant="secondary"
              size="sm"
              onClick={addRow}
              disabled={rows.length >= MAX_PROMPTS}
            >
              <Plus size={16} />
              プロンプトを追加
            </Button>
            <span className={styles.rowCount}>
              {rows.length} / {MAX_PROMPTS}
            </span>
          </div>
          <div className={styles.submitRow}>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={batchMutation.isPending}
            >
              <Sparkles size={16} />
              一括生成
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {submittedJobIds.length > 0 && (
          <Card padding="lg">
            <div className={styles.resultsHeader}>
              <h2 className={styles.sectionTitle}>
                生成結果
                <span className={styles.jobCountBadge}>{totalCount} 件</span>
              </h2>
              <span className={styles.progressLabel}>
                {completedCount}/{totalCount} 完了
              </span>
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {jobStatuses ? (
              <div className={styles.resultsGrid}>
                {jobStatuses.map((job) => (
                  <Link
                    key={job.jobId}
                    href={ROUTES.historyDetail(job.jobId)}
                    className={styles.resultCard}
                  >
                    {job.status === JOB_STATUS.completed && job.imageUrl ? (
                      <div className={styles.thumbnailWrap}>
                        <img
                          src={job.imageUrl}
                          alt="生成サムネイル"
                          className={styles.thumbnail}
                        />
                      </div>
                    ) : (
                      <div className={styles.thumbnailPlaceholder}>
                        {job.status === JOB_STATUS.processing && (
                          <Loader2 size={20} className={styles.spinIcon} />
                        )}
                        {job.status === JOB_STATUS.pending && (
                          <Clock size={20} />
                        )}
                        {job.status === JOB_STATUS.failed && (
                          <AlertCircle size={20} />
                        )}
                        {job.status === JOB_STATUS.completed && !job.imageUrl && (
                          <CheckCircle size={20} />
                        )}
                      </div>
                    )}
                    <div className={styles.resultBody}>
                      <p className={styles.resultPrompt}>{job.prompt}</p>
                      <StatusBadge status={job.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.loadingResults}>
                <Loader2 size={20} className={styles.spinIcon} />
                <span>ジョブ情報を取得中...</span>
              </div>
            )}
          </Card>
        )}

        {/* Empty state when no jobs submitted yet */}
        {submittedJobIds.length === 0 && (
          <Card>
            <EmptyState
              icon={Layers}
              title="バッチ生成結果がありません"
              description="上のフォームからプロンプトを入力して一括生成を実行してください"
            />
          </Card>
        )}
      </div>
    </AppShell>
  );
}
