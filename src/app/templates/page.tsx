"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Plus, Pencil, Trash2, Copy } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/api";
import { getStyleModels } from "@/lib/api";
import { DATE_LOCALE } from "@/consts";
import styles from "./page.module.css";

interface Template {
  id: string;
  userId: string;
  name: string;
  prompt: string;
  styleModelId: string | null;
  sourceJobId: string | null;
  previewS3Key: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formPrompt, setFormPrompt] = useState("");
  const [formStyleModelId, setFormStyleModelId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

  const { data: styleData } = useQuery({
    queryKey: ["styleModels"],
    queryFn: getStyleModels,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createTemplate(formName, formPrompt, formStyleModelId || undefined),
    onSuccess: () => {
      toast.success("テンプレートを作成しました");
      closeForm();
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => {
      toast.error("テンプレートの作成に失敗しました");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTemplate(editingTemplate!.id, {
        name: formName,
        prompt: formPrompt,
        styleModelId: formStyleModelId || undefined,
      }),
    onSuccess: () => {
      toast.success("テンプレートを更新しました");
      closeForm();
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => {
      toast.error("テンプレートの更新に失敗しました");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      toast.success("テンプレートを削除しました");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => {
      toast.error("削除に失敗しました");
    },
  });

  const templates: Template[] = data?.templates || [];
  const styleModels = styleData?.models || [];

  const styleOptions = [
    { value: "", label: "スタイルモデルなし" },
    ...styleModels.map((m: { id: string; name: string }) => ({
      value: m.id,
      label: m.name,
    })),
  ];

  function openCreateForm() {
    setEditingTemplate(null);
    setFormName("");
    setFormPrompt("");
    setFormStyleModelId("");
    setShowForm(true);
  }

  function openEditForm(template: Template) {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormPrompt(template.prompt);
    setFormStyleModelId(template.styleModelId || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTemplate(null);
    setFormName("");
    setFormPrompt("");
    setFormStyleModelId("");
  }

  function handleSubmit() {
    if (editingTemplate) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function handleCopyPrompt(prompt: string) {
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success("プロンプトをコピーしました");
    });
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>テンプレート</h1>
            <p className={styles.subtitle}>
              よく使うプロンプトをテンプレートとして保存
            </p>
          </div>
          <Button onClick={openCreateForm}>
            <Plus size={16} />
            新規テンプレート
          </Button>
        </header>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton height={20} width="60%" />
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="80%" />
                <Skeleton height={14} width="40%" />
              </Card>
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className={styles.grid}>
            {templates.map((template) => (
              <Card key={template.id} variant="interactive" padding="lg">
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FileText size={20} />
                  </div>
                </div>
                <h3 className={styles.cardName}>{template.name}</h3>
                <p className={styles.cardPrompt}>{template.prompt}</p>
                <time className={styles.cardDate}>
                  {new Date(template.createdAt).toLocaleDateString(DATE_LOCALE)}
                </time>
                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyPrompt(template.prompt)}
                  >
                    <Copy size={14} />
                    使用
                  </Button>
                  <div className={styles.cardActionsRight}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditForm(template)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={FileText}
              title="テンプレートがありません"
              description="よく使うプロンプトをテンプレートとして保存して、生成を効率化しましょう"
            >
              <Button onClick={openCreateForm}>
                <Plus size={16} />
                テンプレートを作成
              </Button>
            </EmptyState>
          </Card>
        )}

        {/* Create / Edit Modal */}
        <Modal
          open={showForm}
          onClose={closeForm}
          title={
            editingTemplate ? "テンプレートを編集" : "新しいテンプレートを作成"
          }
        >
          <div className={styles.form}>
            <Input
              label="テンプレート名"
              placeholder="例: 解説動画サムネイル"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Textarea
              label="プロンプト"
              placeholder="サムネイル生成に使うプロンプトを入力..."
              rows={5}
              value={formPrompt}
              onChange={(e) => setFormPrompt(e.target.value)}
            />
            <Select
              label="スタイルモデル（任意）"
              options={styleOptions}
              value={formStyleModelId}
              onChange={(e) => setFormStyleModelId(e.target.value)}
            />
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={closeForm}>
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={!formName.trim() || !formPrompt.trim()}
              >
                {editingTemplate ? (
                  <>
                    <Pencil size={16} />
                    更新
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    作成
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteId !== null}
          onClose={() => setDeleteId(null)}
          title="テンプレートを削除"
        >
          <div className={styles.form}>
            <p className={styles.deleteWarn}>
              このテンプレートを削除しますか？この操作は元に戻せません。
            </p>
            <div className={styles.formActions}>
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
