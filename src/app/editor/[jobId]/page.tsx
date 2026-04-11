"use client";

import { use, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import EditorCanvas from "@/components/Editor/EditorCanvas";
import type { CanvasRef } from "@/components/Editor/EditorCanvas";
import TextTool from "@/components/Editor/TextTool";
import type { TextOptions } from "@/components/Editor/TextTool";
import ColorTool from "@/components/Editor/ColorTool";
import LayerPanel from "@/components/Editor/LayerPanel";
import Toolbar from "@/components/Editor/Toolbar";
import Skeleton from "@/components/ui/Skeleton";
import { getJobStatus, getLayers, editThumbnail, segmentJob } from "@/lib/api";
import { ROUTES, JOB_STATUS } from "@/consts";
import {
  EditorTool,
  EditorHistory,
  createInitialState,
} from "@/lib/editor-state";
import type {
  EditorLayer,
  ColorFilters,
  EditOperation,
} from "@/lib/editor-state";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default function EditorPage({ params }: PageProps) {
  const { jobId } = use(params);
  const queryClient = useQueryClient();
  const canvasRef = useRef<CanvasRef>(null);
  const historyRef = useRef(new EditorHistory());

  const [state, setState] = useState(() => createInitialState(jobId));
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [rightPanel, setRightPanel] = useState<"layers" | "text" | "color">(
    "layers",
  );

  // Fetch job data
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobStatus(jobId),
  });

  // Fetch layers
  const { data: layersData, isLoading: isLayersLoading } = useQuery({
    queryKey: ["layers", jobId],
    queryFn: () => getLayers(jobId),
    enabled: job?.status === JOB_STATUS.completed,
  });

  // Auto-segment if no layers
  const segmentMutation = useMutation({
    mutationFn: () => segmentJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["layers", jobId] });
      toast.success("レイヤー分離が完了しました");
    },
    onError: () => {
      toast.error("レイヤー分離に失敗しました");
    },
  });

  // Save edits
  const saveMutation = useMutation({
    mutationFn: (operations: EditOperation[]) =>
      editThumbnail(jobId, operations),
    onSuccess: () => {
      setState((s) => ({ ...s, isDirty: false, isSaving: false }));
      toast.success("編集を保存しました");
    },
    onError: () => {
      setState((s) => ({ ...s, isSaving: false }));
      toast.error("保存に失敗しました");
    },
  });

  // Initialize layers from API data
  useEffect(() => {
    if (!layersData?.layers) return;

    const editorLayers: EditorLayer[] = layersData.layers.map(
      (layer, index) => ({
        id: `layer-${layer.label}`,
        label: layer.label,
        url: layer.url,
        visible: true,
        locked: false,
        opacity: 1,
        order: index,
      }),
    );
    setLayers(editorLayers);
  }, [layersData]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isMod && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if (isMod && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "v" || e.key === "V") {
        setState((s) => ({ ...s, activeTool: EditorTool.Select }));
      } else if (e.key === "t" || e.key === "T") {
        setState((s) => ({ ...s, activeTool: EditorTool.Text }));
        setRightPanel("text");
      } else if (e.key === "h" || e.key === "H") {
        setState((s) => ({ ...s, activeTool: EditorTool.Move }));
      } else if (e.key === "z" && !isMod) {
        setState((s) => ({ ...s, activeTool: EditorTool.Zoom }));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToolChange = useCallback((tool: EditorTool) => {
    setState((s) => ({ ...s, activeTool: tool }));
    if (tool === EditorTool.Text) {
      setRightPanel("text");
    }
  }, []);

  const handleObjectSelected = useCallback((layerId: string | null) => {
    setState((s) => ({ ...s, selectedLayerId: layerId }));
  }, []);

  const handleObjectModified = useCallback(
    () => {
      setState((s) => ({ ...s, isDirty: true }));
    },
    [],
  );

  const handleZoomChange = useCallback((zoom: number) => {
    setState((s) => ({ ...s, zoom }));
  }, []);

  const handleAddText = useCallback(
    (text: string, options: TextOptions) => {
      canvasRef.current?.addText(text, {
        fontSize: options.fontSize,
        fontFamily: options.fontFamily,
        fill: options.fill,
        fontWeight: options.fontWeight,
        fontStyle: options.fontStyle,
        textAlign: options.textAlign,
      });

      const newLayer: EditorLayer = {
        id: `text-${Date.now()}`,
        label: `Text: ${text.slice(0, 20)}`,
        url: "",
        visible: true,
        locked: false,
        opacity: 1,
        order: layers.length,
      };
      setLayers((prev) => [...prev, newLayer]);
      setState((s) => ({ ...s, isDirty: true }));
    },
    [layers.length],
  );

  const handleColorFiltersChange = useCallback(
    (layerId: string, filters: ColorFilters) => {
      canvasRef.current?.applyColorFilters(layerId, filters);
      setState((s) => ({ ...s, isDirty: true }));
    },
    [],
  );

  const handleToggleVisibility = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    );
  }, []);

  const handleToggleLock = useCallback((layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)),
    );
  }, []);

  const handleReorder = useCallback(
    (layerId: string, direction: "up" | "down") => {
      setLayers((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((l) => l.id === layerId);
        if (idx === -1) return prev;

        const swapIdx = direction === "up" ? idx + 1 : idx - 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

        const newLayers = [...sorted];
        const tempOrder = newLayers[idx].order;
        newLayers[idx] = { ...newLayers[idx], order: newLayers[swapIdx].order };
        newLayers[swapIdx] = { ...newLayers[swapIdx], order: tempOrder };
        return newLayers;
      });
      setState((s) => ({ ...s, isDirty: true }));
    },
    [],
  );

  const handleDeleteLayer = useCallback((layerId: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    setState((s) => ({
      ...s,
      isDirty: true,
      selectedLayerId: s.selectedLayerId === layerId ? null : s.selectedLayerId,
    }));
  }, []);

  const handleOpacityChange = useCallback(
    (layerId: string, opacity: number) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, opacity } : l)),
      );
      setState((s) => ({ ...s, isDirty: true }));
    },
    [],
  );

  const handleSelectLayer = useCallback((layerId: string) => {
    setState((s) => ({ ...s, selectedLayerId: layerId }));
  }, []);

  const handleUndo = useCallback(() => {
    const entry = historyRef.current.undo();
    if (entry) {
      setState((s) => ({ ...s, isDirty: true }));
    }
  }, []);

  const handleRedo = useCallback(() => {
    const entry = historyRef.current.redo();
    if (entry) {
      setState((s) => ({ ...s, isDirty: true }));
    }
  }, []);

  const handleSave = useCallback(() => {
    const operations = historyRef.current.getAllOperations();
    setState((s) => ({ ...s, isSaving: true }));
    saveMutation.mutate(operations);
  }, [saveMutation]);

  const handleExport = useCallback(() => {
    const dataUrl = canvasRef.current?.toDataURL();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `thumbnail-${jobId}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("画像をエクスポートしました");
  }, [jobId]);

  const handleZoomIn = useCallback(() => {
    setState((s) => ({ ...s, zoom: Math.min(s.zoom * 1.25, 5) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setState((s) => ({ ...s, zoom: Math.max(s.zoom * 0.8, 0.1) }));
  }, []);

  const handleZoomFit = useCallback(() => {
    canvasRef.current?.zoomToFit();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally recalculate when isDirty changes
  const canUndo = useMemo(() => historyRef.current.canUndo(), [state.isDirty]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally recalculate when isDirty changes
  const canRedo = useMemo(() => historyRef.current.canRedo(), [state.isDirty]);

  // Loading state
  if (isJobLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.loadingContainer}>
            <Skeleton height={48} />
            <Skeleton height={600} />
          </div>
        </div>
      </AppShell>
    );
  }

  // Job not found or not completed
  if (!job) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.errorContainer}>
            <p>ジョブが見つかりません</p>
            <Link href={ROUTES.history} className={styles.backLink}>
              履歴に戻る
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (job.status !== JOB_STATUS.completed) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.errorContainer}>
            <Loader2 size={32} className={styles.spin} />
            <p>サムネイル生成が完了していません</p>
            <p className={styles.subText}>ステータス: {job.status}</p>
            <Link
              href={ROUTES.historyDetail(jobId)}
              className={styles.backLink}
            >
              ジョブ詳細に戻る
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // No layers yet — offer to segment
  if (!layersData?.layers?.length && !isLayersLoading) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.errorContainer}>
            <p>レイヤーデータがありません</p>
            <p className={styles.subText}>
              編集するにはレイヤー分離を実行してください
            </p>
            <button
              className={styles.segmentBtn}
              onClick={() => segmentMutation.mutate()}
              disabled={segmentMutation.isPending}
            >
              {segmentMutation.isPending && (
                <Loader2 size={16} className={styles.spin} />
              )}
              レイヤー分離を実行
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link href={ROUTES.historyDetail(jobId)} className={styles.backBtn}>
            <ArrowLeft size={16} />
            ジョブ詳細
          </Link>
          <h1 className={styles.title}>サムネイルエディタ</h1>
          <span className={styles.jobId}>{jobId.slice(0, 8)}...</span>
        </div>

        <Toolbar
          activeTool={state.activeTool}
          zoom={state.zoom}
          canUndo={canUndo}
          canRedo={canRedo}
          isDirty={state.isDirty}
          isSaving={state.isSaving}
          onToolChange={handleToolChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onExport={handleExport}
        />

        <div className={styles.editorLayout}>
          <div className={styles.canvasArea}>
            <EditorCanvas
              ref={canvasRef}
              layers={layers}
              activeTool={state.activeTool}
              zoom={state.zoom}
              onObjectSelected={handleObjectSelected}
              onObjectModified={handleObjectModified}
              onZoomChange={handleZoomChange}
            />
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.panelTabs}>
              <button
                className={`${styles.panelTab} ${rightPanel === "layers" ? styles.panelTabActive : ""}`}
                onClick={() => setRightPanel("layers")}
              >
                レイヤー
              </button>
              <button
                className={`${styles.panelTab} ${rightPanel === "text" ? styles.panelTabActive : ""}`}
                onClick={() => setRightPanel("text")}
              >
                テキスト
              </button>
              <button
                className={`${styles.panelTab} ${rightPanel === "color" ? styles.panelTabActive : ""}`}
                onClick={() => setRightPanel("color")}
              >
                色調
              </button>
            </div>

            <div className={styles.panelContent}>
              {rightPanel === "layers" && (
                <LayerPanel
                  layers={layers}
                  selectedLayerId={state.selectedLayerId}
                  onSelectLayer={handleSelectLayer}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                  onReorder={handleReorder}
                  onDeleteLayer={handleDeleteLayer}
                  onOpacityChange={handleOpacityChange}
                />
              )}
              {rightPanel === "text" && <TextTool onAddText={handleAddText} />}
              {rightPanel === "color" && (
                <ColorTool
                  selectedLayerId={state.selectedLayerId}
                  onFiltersChange={handleColorFiltersChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
