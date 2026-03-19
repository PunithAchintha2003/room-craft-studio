import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Tool = 'select' | 'pan' | 'delete' | 'measure';
export type ViewMode = '2d' | '3d';

export interface SnapGuides {
  x: number | null;
  y: number | null;
  xLabel?: string;
  yLabel?: string;
}

interface EditorState {
  selectedFurnitureIds: string[];
  tool: Tool;
  zoom: number;
  canvasOffset: { x: number; y: number };
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  viewMode: ViewMode;
  snapGuides: SnapGuides;
  showRuler: boolean;
  showAlignmentGuides: boolean;
  showCeiling: boolean;
}

const initialState: EditorState = {
  selectedFurnitureIds: [],
  tool: 'select',
  zoom: 1,
  canvasOffset: { x: 0, y: 0 },
  gridSize: 0.5,
  snapToGrid: true,
  showGrid: true,
  viewMode: '2d',
  snapGuides: { x: null, y: null },
  showRuler: true,
  showAlignmentGuides: true,
  showCeiling: false,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setSelectedFurnitureIds(state, action: PayloadAction<string[]>) {
      state.selectedFurnitureIds = action.payload;
    },
    addSelectedFurnitureId(state, action: PayloadAction<string>) {
      if (!state.selectedFurnitureIds.includes(action.payload)) {
        state.selectedFurnitureIds.push(action.payload);
      }
    },
    removeSelectedFurnitureId(state, action: PayloadAction<string>) {
      state.selectedFurnitureIds = state.selectedFurnitureIds.filter(id => id !== action.payload);
    },
    clearSelection(state) {
      state.selectedFurnitureIds = [];
    },
    setTool(state, action: PayloadAction<Tool>) {
      state.tool = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },
    zoomIn(state) {
      state.zoom = Math.min(5, state.zoom + 0.1);
    },
    zoomOut(state) {
      state.zoom = Math.max(0.1, state.zoom - 0.1);
    },
    resetZoom(state) {
      state.zoom = 1;
    },
    setCanvasOffset(state, action: PayloadAction<{ x: number; y: number }>) {
      state.canvasOffset = action.payload;
    },
    panCanvas(state, action: PayloadAction<{ dx: number; dy: number }>) {
      state.canvasOffset.x += action.payload.dx;
      state.canvasOffset.y += action.payload.dy;
    },
    setGridSize(state, action: PayloadAction<number>) {
      state.gridSize = action.payload;
    },
    toggleSnapToGrid(state) {
      state.snapToGrid = !state.snapToGrid;
    },
    toggleShowGrid(state) {
      state.showGrid = !state.showGrid;
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
    },
    setSnapGuides(state, action: PayloadAction<SnapGuides>) {
      state.snapGuides = action.payload;
    },
    clearSnapGuides(state) {
      state.snapGuides = { x: null, y: null };
    },
    toggleShowRuler(state) {
      state.showRuler = !state.showRuler;
    },
    toggleAlignmentGuides(state) {
      state.showAlignmentGuides = !state.showAlignmentGuides;
    },
    toggleShowCeiling(state) {
      state.showCeiling = !state.showCeiling;
    },
    resetEditor() {
      return initialState;
    },
  },
});

export const {
  setSelectedFurnitureIds,
  addSelectedFurnitureId,
  removeSelectedFurnitureId,
  clearSelection,
  setTool,
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setCanvasOffset,
  panCanvas,
  setGridSize,
  toggleSnapToGrid,
  toggleShowGrid,
  setViewMode,
  setSnapGuides,
  clearSnapGuides,
  toggleShowRuler,
  toggleAlignmentGuides,
  toggleShowCeiling,
  resetEditor,
} = editorSlice.actions;

export default editorSlice.reducer;
