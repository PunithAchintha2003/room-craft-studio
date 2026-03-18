import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import {
  clearSelection,
  setTool,
  setViewMode,
  zoomIn,
  zoomOut,
  resetZoom,
  ViewMode,
} from '@/features/editor/editorSlice';
import {
  undo,
  redo,
  removeFurnitureFromDesign,
  addFurnitureToDesign,
  updateFurnitureInDesign,
} from '@/features/design/designSlice';

interface UseKeyboardShortcutsOptions {
  onSave?: () => void;
  onHelp?: () => void;
  onFitToRoom?: () => void;
}

export const useKeyboardShortcuts = (options: UseKeyboardShortcutsOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();

  const selectedFurnitureIds = useSelector(
    (state: RootState) => state.editor.selectedFurnitureIds
  );
  const tool = useSelector((state: RootState) => state.editor.tool);
  const canUndo = useSelector((state: RootState) => state.design.historyIndex > 0);
  const canRedo = useSelector(
    (state: RootState) => state.design.historyIndex < state.design.history.length - 1
  );
  const viewMode = useSelector((state: RootState) => state.editor.viewMode);

  const currentDesign = useSelector((state: RootState) => state.design.currentDesign);
  const furniture = useSelector((state: RootState) => state.furniture.furniture);

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      if (!currentDesign || selectedFurnitureIds.length === 0) return;
      selectedFurnitureIds.forEach(id => {
        const item = currentDesign.furniture.find(f => f.id === id);
        if (!item) return;
        const furnitureData = furniture.find(f => f._id === item.furnitureId);
        if (!furnitureData) return;

        const newX = Math.max(
          0,
          Math.min(currentDesign.room.width - furnitureData.dimensions.width, item.position.x + dx)
        );
        const newY = Math.max(
          0,
          Math.min(
            currentDesign.room.length - furnitureData.dimensions.length,
            item.position.y + dy
          )
        );
        dispatch(updateFurnitureInDesign({ id, updates: { position: { x: newX, y: newY } } }));
      });
    },
    [currentDesign, selectedFurnitureIds, furniture, dispatch]
  );

  const duplicateSelected = useCallback(() => {
    if (!currentDesign || selectedFurnitureIds.length === 0) return;
    selectedFurnitureIds.forEach(id => {
      const item = currentDesign.furniture.find(f => f.id === id);
      if (!item) return;
      dispatch(
        addFurnitureToDesign({
          furnitureId: item.furnitureId,
          position: { x: item.position.x + 0.5, y: item.position.y + 0.5 },
          rotation: item.rotation,
          scale: item.scale,
          color: item.color,
        })
      );
    });
  }, [currentDesign, selectedFurnitureIds, dispatch]);

  const deleteSelected = useCallback(() => {
    selectedFurnitureIds.forEach(id => dispatch(removeFurnitureFromDesign(id)));
    dispatch(clearSelection());
  }, [selectedFurnitureIds, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) return;

      const ctrl = e.metaKey || e.ctrlKey;

      // ── Save ──────────────────────────────────────────────
      if (ctrl && e.key === 's') {
        e.preventDefault();
        options.onSave?.();
        return;
      }

      // ── Undo / Redo ───────────────────────────────────────
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) dispatch(undo());
        return;
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) dispatch(redo());
        return;
      }

      // ── Zoom ──────────────────────────────────────────────
      if (ctrl && e.key === '=') { e.preventDefault(); dispatch(zoomIn()); return; }
      if (ctrl && e.key === '-') { e.preventDefault(); dispatch(zoomOut()); return; }
      if (ctrl && e.key === '0') { e.preventDefault(); dispatch(resetZoom()); return; }

      // ── Duplicate ─────────────────────────────────────────
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // ── View modes ────────────────────────────────────────
      if (!ctrl && e.key === '1') { e.preventDefault(); dispatch(setViewMode('2d' as ViewMode)); return; }
      if (!ctrl && e.key === '2') { e.preventDefault(); dispatch(setViewMode('split' as ViewMode)); return; }
      if (!ctrl && e.key === '3') { e.preventDefault(); dispatch(setViewMode('3d' as ViewMode)); return; }

      // ── Tool shortcuts ────────────────────────────────────
      if (!ctrl && e.key === 'v') { e.preventDefault(); dispatch(setTool('select')); return; }
      if (!ctrl && e.key === 'p') { e.preventDefault(); dispatch(setTool('pan')); return; }
      if (!ctrl && e.key === 'm') {
        e.preventDefault();
        dispatch(setTool(tool === 'measure' ? 'select' : 'measure'));
        return;
      }

      // ── Help ──────────────────────────────────────────────
      if (e.key === '?') { e.preventDefault(); options.onHelp?.(); return; }

      // ── Fit to room ───────────────────────────────────────
      if (!ctrl && e.key === 'f') { e.preventDefault(); options.onFitToRoom?.(); return; }

      // ── Escape: deselect ──────────────────────────────────
      if (e.key === 'Escape') {
        e.preventDefault();
        dispatch(clearSelection());
        return;
      }

      // ── Delete / Backspace ────────────────────────────────
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFurnitureIds.length > 0) {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // ── Arrow nudge ───────────────────────────────────────
      if (selectedFurnitureIds.length > 0) {
        const step = e.shiftKey ? 0.5 : 0.1;
        switch (e.key) {
          case 'ArrowLeft':  e.preventDefault(); nudgeSelected(-step, 0); return;
          case 'ArrowRight': e.preventDefault(); nudgeSelected(step, 0); return;
          case 'ArrowUp':    e.preventDefault(); nudgeSelected(0, -step); return;
          case 'ArrowDown':  e.preventDefault(); nudgeSelected(0, step); return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canUndo,
    canRedo,
    tool,
    viewMode,
    selectedFurnitureIds,
    dispatch,
    nudgeSelected,
    duplicateSelected,
    deleteSelected,
    options,
  ]);
};
