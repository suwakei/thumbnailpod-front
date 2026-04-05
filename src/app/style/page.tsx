"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Palette, Plus, Trash2, Brain, ImageIcon } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import { getStyleModels, createLearnJob, deleteStyleModel } from "@/lib/api";
import styles from "./page.module.css";

export default function StylePage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["styleModels"],
    queryFn: getStyleModels,
  });

  const createMutation = useMutation({
    mutationFn: () => createLearnJob(newName, []),
    onSuccess: () => {
      toast.success("スタイル学習を開始しました");
      setShowCreate(false);
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["styleModels"] });
    },
    onError: () => {
      toast.error("学習の開始に失敗しました");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStyleModel(id),
    onSuccess: () => {
      toast.success("モデルを削除しました");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["styleModels"] });
    },
    onError: () => {
      toast.error("削除に失敗しました");
    },
  });

  const models = data?.models || [];

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>スタイルモデル</h1>
            <p className={styles.subtitle}>
              あなたのサムネイルスタイルを AI に学習させる
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            新規学習
          </Button>
        </header>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton height={20} width="60%" />
                <Skeleton height={14} width="40%" />
              </Card>
            ))}
          </div>
        ) : models.length > 0 ? (
          <div className={styles.grid}>
            {models.map((model) => (
              <Card key={model.id} variant="interactive" padding="lg">
                <div className={styles.modelHeader}>
                  <div className={styles.modelIcon}>
                    <Brain size={20} />
                  </div>
                  <StatusBadge status={model.status} />
                </div>
                <h3 className={styles.modelName}>{model.name}</h3>
                <div className={styles.modelMeta}>
                  <div className={styles.metaItem}>
                    <ImageIcon size={14} />
                    <span>{model.sourceVideoCount} 枚から学習</span>
                  </div>
                  <time className={styles.metaDate}>
                    {new Date(model.createdAt).toLocaleDateString("ja-JP")}
                  </time>
                </div>
                <div className={styles.modelActions}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(model.id)}
                  >
                    <Trash2 size={14} />
                    削除
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={Palette}
              title="スタイルモデルがありません"
              description="YouTubeチャンネルのサムネイルからスタイルを学習しましょう"
            >
              <Button onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                学習を開始
              </Button>
            </EmptyState>
          </Card>
        )}

        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="新しいスタイルモデルを作成"
        >
          <div className={styles.createForm}>
            <Input
              label="モデル名"
              placeholder="例: メインチャンネルスタイル"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <p className={styles.createHint}>
              YouTubeチャンネルのサムネイルを自動取得して学習します。
              学習には数分かかる場合があります。
            </p>
            <div className={styles.createActions}>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                キャンセル
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
                disabled={!newName.trim()}
              >
                <Brain size={16} />
                学習開始
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="モデルを削除"
        >
          <div className={styles.createForm}>
            <p className={styles.deleteWarn}>
              このスタイルモデルを削除しますか？この操作は元に戻せません。
            </p>
            <div className={styles.createActions}>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>
                キャンセル
              </Button>
              <Button
                variant="danger"
                loading={deleteMutation.isPending}
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              >
                <Trash2 size={16} />
                削除する
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
