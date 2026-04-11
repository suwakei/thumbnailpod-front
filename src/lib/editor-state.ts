/**
 * Editor state management for the Canvas-based thumbnail editor.
 * Manages undo/redo history, layer operations, and edit operation tracking.
 */

// === Operation types matching backend API schema ===

export interface TextChangeOperation {
  type: "text_change";
  layer: string;
  content: string;
  position: { x: number; y: number };
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
}

export interface ColorAdjustOperation {
  type: "color_adjust";
  layer: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export interface MoveOperation {
  type: "move";
  layer: string;
  offset: { dx: number; dy: number };
}

export interface ScaleOperation {
  type: "scale";
  layer: string;
  scaleX: number;
  scaleY: number;
}

export interface RotateOperation {
  type: "rotate";
  layer: string;
  angle: number;
}

export interface DeleteOperation {
  type: "delete";
  layer: string;
}

export type EditOperation =
  | TextChangeOperation
  | ColorAdjustOperation
  | MoveOperation
  | ScaleOperation
  | RotateOperation
  | DeleteOperation;

// === Layer state ===

export interface EditorLayer {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

// === Editor tool modes ===

export const EditorTool = {
  Select: "select",
  Text: "text",
  Move: "move",
  Zoom: "zoom",
} as const;
export type EditorTool = (typeof EditorTool)[keyof typeof EditorTool];

// === Undo/Redo history ===

interface HistoryEntry {
  operations: EditOperation[];
  timestamp: number;
}

export class EditorHistory {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly maxEntries: number;

  constructor(maxEntries = 50) {
    this.maxEntries = maxEntries;
  }

  push(operations: EditOperation[]) {
    this.undoStack.push({ operations, timestamp: Date.now() });
    if (this.undoStack.length > this.maxEntries) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): HistoryEntry | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.redoStack.push(entry);
    return entry;
  }

  redo(): HistoryEntry | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    this.undoStack.push(entry);
    return entry;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  getAllOperations(): EditOperation[] {
    return this.undoStack.flatMap((entry) => entry.operations);
  }
}

// === Editor state ===

export interface EditorState {
  jobId: string;
  layers: EditorLayer[];
  activeTool: EditorTool;
  selectedLayerId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  isDirty: boolean;
  isSaving: boolean;
}

export function createInitialState(jobId: string): EditorState {
  return {
    jobId,
    layers: [],
    activeTool: EditorTool.Select,
    selectedLayerId: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    isDirty: false,
    isSaving: false,
  };
}

// === Color adjustment utilities ===

export interface ColorFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_FILTERS: ColorFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
};

export function filtersToFabric(filters: ColorFilters) {
  return {
    brightness: filters.brightness / 100,
    contrast: filters.contrast / 100,
    saturation: filters.saturation / 100,
  };
}
