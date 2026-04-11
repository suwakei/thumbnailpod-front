"use client";

import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import type { EditorLayer } from "@/lib/editor-state";
import styles from "./LayerPanel.module.css";

interface LayerPanelProps {
  layers: EditorLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onReorder: (layerId: string, direction: "up" | "down") => void;
  onDeleteLayer: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onReorder,
  onDeleteLayer,
  onOpacityChange,
}: LayerPanelProps) {
  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Layers size={16} />
        <span>レイヤー</span>
        <span className={styles.count}>{layers.length}</span>
      </div>

      <div className={styles.layerList}>
        {sortedLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const isText = layer.id.startsWith("text-");

          return (
            <div
              key={layer.id}
              className={`${styles.layerItem} ${isSelected ? styles.layerItemSelected : ""}`}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className={styles.layerMain}>
                <div
                  className={styles.layerThumb}
                  style={{
                    opacity: layer.visible ? 1 : 0.3,
                  }}
                >
                  {isText ? (
                    <span className={styles.textIcon}>T</span>
                  ) : (
                    <img
                      src={layer.url}
                      alt={layer.label}
                      className={styles.thumbImg}
                    />
                  )}
                </div>

                <div className={styles.layerInfo}>
                  <span
                    className={styles.layerLabel}
                    style={{ opacity: layer.visible ? 1 : 0.4 }}
                  >
                    {layer.label}
                  </span>
                  <span className={styles.layerMeta}>
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>

                <div className={styles.layerActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    title={layer.visible ? "非表示" : "表示"}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    title={layer.locked ? "ロック解除" : "ロック"}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              </div>

              {isSelected && (
                <div className={styles.layerDetails}>
                  <div className={styles.opacityRow}>
                    <label className={styles.opacityLabel}>不透明度</label>
                    <input
                      type="range"
                      className={styles.opacitySlider}
                      min={0}
                      max={100}
                      value={Math.round(layer.opacity * 100)}
                      onChange={(e) =>
                        onOpacityChange(layer.id, Number(e.target.value) / 100)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={styles.opacityValue}>
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>

                  <div className={styles.orderActions}>
                    <button
                      className={styles.orderBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorder(layer.id, "up");
                      }}
                      disabled={
                        layer.order === Math.max(...layers.map((l) => l.order))
                      }
                      title="前面へ"
                    >
                      <ChevronUp size={14} />
                      前面
                    </button>
                    <button
                      className={styles.orderBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReorder(layer.id, "down");
                      }}
                      disabled={
                        layer.order === Math.min(...layers.map((l) => l.order))
                      }
                      title="背面へ"
                    >
                      <ChevronDown size={14} />
                      背面
                    </button>
                    {isText && (
                      <button
                        className={`${styles.orderBtn} ${styles.deleteBtn}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer.id);
                        }}
                        title="削除"
                      >
                        <Trash2 size={14} />
                        削除
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {layers.length === 0 && (
        <p className={styles.empty}>レイヤーがありません</p>
      )}
    </div>
  );
}
