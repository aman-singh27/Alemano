import {create} from 'zustand';
import type {MarkerCapture} from '../types';

interface MarkerState {
  capturedMarkers: MarkerCapture[];
  draftMarker: MarkerCapture | null;
  scanCount: number;
  addMarker: (marker: MarkerCapture) => void;
  setDraftMarker: (marker: MarkerCapture | null) => void;
  commitDraftMarker: () => void;
  updateDraftMarker: (
    updater: (marker: MarkerCapture) => MarkerCapture,
  ) => void;
  removeMarker: (id: string) => void;
  clearAll: () => void;
}

const MAX_MARKERS = 20;

export const useMarkerStore = create<MarkerState>(set => ({
  capturedMarkers: [],
  draftMarker: null,
  scanCount: 0,
  addMarker: marker =>
    set(state => {
      if (state.capturedMarkers.length >= MAX_MARKERS) {
        return state;
      }

      const capturedMarkers = [...state.capturedMarkers, marker];

      return {
        capturedMarkers,
        scanCount: capturedMarkers.length,
      };
    }),
  setDraftMarker: marker => set({draftMarker: marker}),
  commitDraftMarker: () =>
    set(state => {
      if (
        state.draftMarker == null ||
        state.capturedMarkers.length >= MAX_MARKERS
      ) {
        return state;
      }

      const capturedMarkers = [...state.capturedMarkers, state.draftMarker];

      return {
        capturedMarkers,
        draftMarker: null,
        scanCount: capturedMarkers.length,
      };
    }),
  updateDraftMarker: updater =>
    set(state => ({
      draftMarker:
        state.draftMarker == null ? null : updater(state.draftMarker),
    })),
  removeMarker: id =>
    set(state => {
      const capturedMarkers = state.capturedMarkers.filter(
        marker => marker.id !== id,
      );

      return {
        capturedMarkers,
        scanCount: capturedMarkers.length,
      };
    }),
  clearAll: () => ({capturedMarkers: [], draftMarker: null, scanCount: 0}),
}));
