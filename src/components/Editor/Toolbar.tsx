"use client";

import {
  MousePointer2,
  Type,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  Save,
  Download,
  Loader2,
} from "lucide-react";
import { EditorTool } from "@/lib/editor-state";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  activeTool: EditorTool;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onToolChange: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
}

const tools = [
  { id: EditorTool.Select, icon: MousePointer2, label: "選択 (V)" },
  { id: EditorTool.Text, icon: Type, label: "テキスト (T)" },
  { id: EditorTool.Move, icon: Move, label: "移動 (H)" },
  { id: EditorTool.Zoom, icon: ZoomIn, label: "ズーム (Z)" },
] as const;

export default function Toolbar({
  activeTool,
  zoom,
  canUndo,
  canRedo,
  isDirty,
  isSaving,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onUndo,
  onRedo,
  onSave,
  onExport,
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`${styles.toolBtn} ${activeTool === id ? styles.toolBtnActive : ""}`}
            onClick={() => onToolChange(id)}
            title={label}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      <div className={styles.separator} />

      <div className={styles.group}>
        <button
          className={styles.toolBtn}
          onClick={onUndo}
          disabled={!canUndo}
          title="元に戻す (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          className={styles.toolBtn}
          onClick={onRedo}
          disabled={!canRedo}
          title="やり直し (Ctrl+Shift+Z)"
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className={styles.separator} />

      <div className={styles.group}>
        <button
          className={styles.toolBtn}
          onClick={onZoomOut}
          title="ズームアウト"
        >
          <ZoomOut size={18} />
        </button>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <button
          className={styles.toolBtn}
          onClick={onZoomIn}
          title="ズームイン"
        >
          <ZoomIn size={18} />
        </button>
        <button
          className={styles.toolBtn}
          onClick={onZoomFit}
          title="画面に合わせる"
        >
          <Maximize size={18} />
        </button>
      </div>

      <div className={styles.spacer} />

      <div className={styles.group}>
        <button
          className={styles.actionBtn}
          onClick={onExport}
          title="エクスポート"
        >
          <Download size={16} />
          エクスポート
        </button>
        <button
          className={`${styles.saveBtn} ${isDirty ? styles.saveBtnDirty : ""}`}
          onClick={onSave}
          disabled={isSaving || !isDirty}
          title="保存 (Ctrl+S)"
        >
          {isSaving ? <Loader2 size={16} className={styles.spinner} /> : <Save size={16} />}
          {isSaving ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
