"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Webhook as WebhookIcon,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Power,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from "@/lib/api";
import { WEBHOOK_EVENTS } from "@/consts";
import type { Webhook } from "@/types/api";
import styles from "./page.module.css";

export default function WebhooksPage() {
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Webhook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set(),
  );

  // Form state
  const [formUrl, setFormUrl] = useState("");
  const [formEvents, setFormEvents] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: getWebhooks,
  });

  const webhooks = data?.webhooks ?? [];

  const createMutation = useMutation({
    mutationFn: () => createWebhook(formUrl, Array.from(formEvents)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook を作成しました");
      closeCreateModal();
    },
    onError: () => toast.error("Webhook の作成に失敗しました"),
  });

  const editMutation = useMutation({
    mutationFn: () =>
      updateWebhook(editTarget!.id, {
        url: formUrl,
        events: Array.from(formEvents),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook を更新しました");
      closeEditModal();
    },
    onError: () => toast.error("Webhook の更新に失敗しました"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWebhook(deleteTarget!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook を削除しました");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Webhook の削除に失敗しました"),
  });

  const toggleMutation = useMutation({
    mutationFn: (wh: Webhook) => updateWebhook(wh.id, { active: !wh.active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
    onError: () => toast.error("状態の変更に失敗しました"),
  });

  function openCreateModal() {
    setFormUrl("");
    setFormEvents(new Set());
    setCreateOpen(true);
  }

  function closeCreateModal() {
    setCreateOpen(false);
    setFormUrl("");
    setFormEvents(new Set());
  }

  function openEditModal(wh: Webhook) {
    setFormUrl(wh.url);
    setFormEvents(new Set(wh.events));
    setEditTarget(wh);
  }

  function closeEditModal() {
    setEditTarget(null);
    setFormUrl("");
    setFormEvents(new Set());
  }

  function toggleEvent(event: string) {
    setFormEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }

  function toggleSecretReveal(id: string) {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      toast.success("シークレットをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  const isFormValid = formUrl.trim().length > 0 && formEvents.size > 0;

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <WebhookIcon size={24} className={styles.headerIcon} />
            <h1 className={styles.title}>Webhooks</h1>
          </div>
          <Button onClick={openCreateModal}>
            <Plus size={16} />
            新規作成
          </Button>
        </header>

        {isLoading ? (
          <div className={styles.stack}>
            {[0, 1, 2].map((i) => (
              <Card key={i} padding="lg">
                <div className={styles.skeletonCard}>
                  <Skeleton height={16} width="60%" />
                  <Skeleton height={14} width="40%" />
                  <Skeleton height={14} width="30%" />
                </div>
              </Card>
            ))}
          </div>
        ) : webhooks.length === 0 ? (
          <EmptyState
            icon={WebhookIcon}
            title="Webhook がありません"
            description="Webhook を作成して、イベント通知を受け取りましょう"
          >
            <Button onClick={openCreateModal}>
              <Plus size={16} />
              Webhook を作成
            </Button>
          </EmptyState>
        ) : (
          <div className={styles.stack}>
            {webhooks.map((wh) => (
              <Card key={wh.id} padding="lg">
                <div className={styles.cardContent}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardInfo}>
                      <span className={styles.url}>{wh.url}</span>
                      <div className={styles.tags}>
                        {wh.events.map((ev) => (
                          <span key={ev} className={styles.tag}>
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.statusToggle} ${wh.active ? styles.active : styles.inactive}`}
                        onClick={() => toggleMutation.mutate(wh)}
                        title={wh.active ? "有効" : "無効"}
                      >
                        <Power size={14} />
                        {wh.active ? "有効" : "無効"}
                      </button>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => openEditModal(wh)}
                        title="編集"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => setDeleteTarget(wh)}
                        title="削除"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className={styles.secretRow}>
                    <span className={styles.secretLabel}>Secret:</span>
                    <code className={styles.secretValue}>
                      {revealedSecrets.has(wh.id)
                        ? wh.secret
                        : "••••••••••••••••"}
                    </code>
                    <button
                      className={styles.iconBtn}
                      onClick={() => toggleSecretReveal(wh.id)}
                      title={revealedSecrets.has(wh.id) ? "隠す" : "表示"}
                    >
                      {revealedSecrets.has(wh.id) ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => copySecret(wh.secret)}
                      title="コピー"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <Modal
          open={createOpen}
          onClose={closeCreateModal}
          title="Webhook を作成"
        >
          <div className={styles.modalForm}>
            <Input
              label="Endpoint URL"
              placeholder="https://example.com/webhook"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
            <fieldset className={styles.eventFieldset}>
              <legend className={styles.eventLegend}>イベント</legend>
              <div className={styles.eventList}>
                {WEBHOOK_EVENTS.map((ev) => (
                  <label key={ev} className={styles.eventCheckbox}>
                    <input
                      type="checkbox"
                      checked={formEvents.has(ev)}
                      onChange={() => toggleEvent(ev)}
                    />
                    <span>{ev}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeCreateModal}>
                キャンセル
              </Button>
              <Button
                loading={createMutation.isPending}
                disabled={!isFormValid}
                onClick={() => createMutation.mutate()}
              >
                作成
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={editTarget !== null}
          onClose={closeEditModal}
          title="Webhook を編集"
        >
          <div className={styles.modalForm}>
            <Input
              label="Endpoint URL"
              placeholder="https://example.com/webhook"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
            />
            <fieldset className={styles.eventFieldset}>
              <legend className={styles.eventLegend}>イベント</legend>
              <div className={styles.eventList}>
                {WEBHOOK_EVENTS.map((ev) => (
                  <label key={ev} className={styles.eventCheckbox}>
                    <input
                      type="checkbox"
                      checked={formEvents.has(ev)}
                      onChange={() => toggleEvent(ev)}
                    />
                    <span>{ev}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeEditModal}>
                キャンセル
              </Button>
              <Button
                loading={editMutation.isPending}
                disabled={!isFormValid}
                onClick={() => editMutation.mutate()}
              >
                保存
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          title="Webhook を削除"
        >
          <div className={styles.modalForm}>
            <p className={styles.deleteMessage}>
              この Webhook を削除しますか？この操作は元に戻せません。
            </p>
            <code className={styles.deleteUrl}>{deleteTarget?.url}</code>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                キャンセル
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                <Trash2 size={14} />
                削除
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
