"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Canvas, FabricImage, FabricText, filters } from "fabric";
import type { EditorLayer, EditorTool, ColorFilters } from "@/lib/editor-state";
import { filtersToFabric } from "@/lib/editor-state";
import styles from "./EditorCanvas.module.css";

export interface CanvasRef {
  getCanvas: () => Canvas | null;
  addText: (text: string, options?: Partial<FabricTextOptions>) => void;
  applyColorFilters: (layerId: string, colorFilters: ColorFilters) => void;
  zoomToFit: () => void;
  exportJSON: () => string;
  toDataURL: () => string;
}

interface FabricTextOptions {
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  left: number;
  top: number;
}

interface EditorCanvasProps {
  layers: EditorLayer[];
  activeTool: EditorTool;
  zoom: number;
  onObjectSelected: (layerId: string | null) => void;
  onObjectModified: (
    layerId: string,
    type: string,
    data: Record<string, unknown>,
  ) => void;
  onZoomChange: (zoom: number) => void;
}

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const EditorCanvas = forwardRef<CanvasRef, EditorCanvasProps>(
  function EditorCanvas(
    {
      layers,
      activeTool,
      zoom,
      onObjectSelected,
      onObjectModified,
      onZoomChange,
    },
    ref,
  ) {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedLayersRef = useRef<Set<string>>(new Set());

    // Initialize canvas
    useEffect(() => {
      if (!canvasElRef.current) return;

      const canvas = new Canvas(canvasElRef.current, {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#1a1a1a",
        preserveObjectStacking: true,
        selection: true,
      });

      fabricRef.current = canvas;

      canvas.on("selection:created", (e) => {
        const obj = e.selected?.[0];
        if (obj) {
          onObjectSelected(
            (obj as unknown as { layerId?: string }).layerId ?? null,
          );
        }
      });

      canvas.on("selection:updated", (e) => {
        const obj = e.selected?.[0];
        if (obj) {
          onObjectSelected(
            (obj as unknown as { layerId?: string }).layerId ?? null,
          );
        }
      });

      canvas.on("selection:cleared", () => {
        onObjectSelected(null);
      });

      canvas.on("object:modified", (e) => {
        const obj = e.target;
        if (!obj) return;
        const layerId = (obj as unknown as { layerId?: string }).layerId;
        if (!layerId) return;

        onObjectModified(layerId, "transform", {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
        });
      });

      // Zoom with mouse wheel
      canvas.on("mouse:wheel", (opt) => {
        const e = opt.e as WheelEvent;
        e.preventDefault();
        e.stopPropagation();

        let newZoom = canvas.getZoom() * 0.999 ** e.deltaY;
        newZoom = Math.max(0.1, Math.min(5, newZoom));

        const point = canvas.getScenePoint(e);
        canvas.zoomToPoint(point, newZoom);
        onZoomChange(newZoom);
      });

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        loadedLayersRef.current.clear();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update tool mode
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      switch (activeTool) {
        case "select":
          canvas.selection = true;
          canvas.defaultCursor = "default";
          canvas.forEachObject((obj) => {
            obj.selectable = !(obj as unknown as { locked?: boolean }).locked;
            obj.evented = true;
          });
          break;
        case "move":
          canvas.selection = false;
          canvas.defaultCursor = "grab";
          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.evented = false;
          });
          break;
        case "text":
          canvas.selection = true;
          canvas.defaultCursor = "text";
          canvas.forEachObject((obj) => {
            obj.selectable = true;
            obj.evented = true;
          });
          break;
        case "zoom":
          canvas.selection = false;
          canvas.defaultCursor = "zoom-in";
          canvas.forEachObject((obj) => {
            obj.selectable = false;
            obj.evented = false;
          });
          break;
      }
      canvas.requestRenderAll();
    }, [activeTool]);

    // Load layers onto canvas
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const loadLayers = async () => {
        for (const layer of layers) {
          if (loadedLayersRef.current.has(layer.id)) {
            // Update existing layer visibility/opacity
            const objects = canvas.getObjects();
            const existing = objects.find(
              (obj) =>
                (obj as unknown as { layerId?: string }).layerId === layer.id,
            );
            if (existing) {
              existing.visible = layer.visible;
              existing.opacity = layer.opacity;
              existing.selectable = !layer.locked;
              existing.evented = !layer.locked;
            }
            continue;
          }

          try {
            const img = await FabricImage.fromURL(layer.url, {
              crossOrigin: "anonymous",
            });
            (img as unknown as { layerId: string }).layerId = layer.id;
            (img as unknown as { layerLabel: string }).layerLabel = layer.label;
            img.visible = layer.visible;
            img.opacity = layer.opacity;
            img.selectable = !layer.locked;
            img.evented = !layer.locked;

            // Scale to fit canvas
            const scaleX = CANVAS_WIDTH / (img.width ?? CANVAS_WIDTH);
            const scaleY = CANVAS_HEIGHT / (img.height ?? CANVAS_HEIGHT);
            img.scaleX = scaleX;
            img.scaleY = scaleY;
            img.left = 0;
            img.top = 0;

            canvas.add(img);
            loadedLayersRef.current.add(layer.id);
          } catch {
            console.error(`Failed to load layer: ${layer.label}`);
          }
        }

        // Reorder objects to match layer order
        const objects = canvas.getObjects();
        const sorted = [...objects].sort((a, b) => {
          const aLayer = layers.find(
            (l) => l.id === (a as unknown as { layerId?: string }).layerId,
          );
          const bLayer = layers.find(
            (l) => l.id === (b as unknown as { layerId?: string }).layerId,
          );
          return (aLayer?.order ?? 0) - (bLayer?.order ?? 0);
        });

        sorted.forEach((obj, index) => {
          canvas.moveObjectTo(obj, index);
        });

        canvas.requestRenderAll();
      };

      loadLayers();
    }, [layers]);

    // Zoom
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const center = canvas.getCenterPoint();
      canvas.zoomToPoint(center, zoom);
      canvas.requestRenderAll();
    }, [zoom]);

    const addText = useCallback(
      (text: string, options?: Partial<FabricTextOptions>) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const textObj = new FabricText(text, {
          left: options?.left ?? CANVAS_WIDTH / 2,
          top: options?.top ?? CANVAS_HEIGHT / 2,
          fontSize: options?.fontSize ?? 48,
          fontFamily: options?.fontFamily ?? "Roboto",
          fill: options?.fill ?? "#ffffff",
          fontWeight: options?.fontWeight ?? "bold",
          fontStyle:
            (options?.fontStyle as "" | "normal" | "italic" | "oblique") ??
            "normal",
          textAlign: options?.textAlign ?? "center",
          originX: "center",
          originY: "center",
          editable: true,
        });

        const layerId = `text-${Date.now()}`;
        (textObj as unknown as { layerId: string }).layerId = layerId;
        (textObj as unknown as { layerLabel: string }).layerLabel =
          `Text: ${text.slice(0, 20)}`;

        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.requestRenderAll();

        onObjectSelected(layerId);
      },
      [onObjectSelected],
    );

    const applyColorFilters = useCallback(
      (layerId: string, colorFilters: ColorFilters) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const obj = canvas
          .getObjects()
          .find(
            (o) => (o as unknown as { layerId?: string }).layerId === layerId,
          );
        if (!obj || !(obj instanceof FabricImage)) return;

        const f = filtersToFabric(colorFilters);
        obj.filters = [
          new filters.Brightness({ brightness: f.brightness }),
          new filters.Contrast({ contrast: f.contrast }),
          new filters.Saturation({ saturation: f.saturation }),
        ];
        obj.applyFilters();
        canvas.requestRenderAll();
      },
      [],
    );

    const zoomToFit = useCallback(() => {
      const canvas = fabricRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const fitZoom =
        Math.min(
          containerWidth / CANVAS_WIDTH,
          containerHeight / CANVAS_HEIGHT,
        ) * 0.9;

      const vpw = containerWidth / fitZoom;
      const vph = containerHeight / fitZoom;
      const offsetX = ((vpw - CANVAS_WIDTH) / 2) * fitZoom;
      const offsetY = ((vph - CANVAS_HEIGHT) / 2) * fitZoom;
      canvas.setZoom(fitZoom);
      canvas.viewportTransform[4] = offsetX;
      canvas.viewportTransform[5] = offsetY;
      onZoomChange(fitZoom);
      canvas.requestRenderAll();
    }, [onZoomChange]);

    const exportJSON = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return "{}";
      return JSON.stringify(canvas.toJSON());
    }, []);

    const toDataURL = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return "";
      return canvas.toDataURL({ format: "png", multiplier: 2 });
    }, []);

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      addText,
      applyColorFilters,
      zoomToFit,
      exportJSON,
      toDataURL,
    }));

    return (
      <div ref={containerRef} className={styles.canvasContainer}>
        <canvas ref={canvasElRef} />
      </div>
    );
  },
);

export default EditorCanvas;
