/**
 * SwiftCover Global State Store
 * Zustand store with localStorage persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DisruptionEvent, SimulationResult } from "../types";

// ============================================================================
// Store State Interface
// ============================================================================

interface AppState {
  // Persisted state
  currentWorkerId: number | null;

  // Non-persisted state
  activeDisruptions: DisruptionEvent[];
  simulatorResult: SimulationResult | null;
  isSimulating: boolean;

  // Actions
  setWorkerId: (id: number) => void;
  clearWorker: () => void;
  setDisruptions: (disruptions: DisruptionEvent[]) => void;
  setSimulating: (isSimulating: boolean) => void;
  setSimulatorResult: (result: SimulationResult | null) => void;
}

// ============================================================================
// Zustand Store with Persist Middleware
// ============================================================================

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentWorkerId: null,
      activeDisruptions: [],
      simulatorResult: null,
      isSimulating: false,

      // Actions
      setWorkerId: (id: number) => {
        set({ currentWorkerId: id });
      },

      clearWorker: () => {
        set({ currentWorkerId: null });
      },

      setDisruptions: (disruptions: DisruptionEvent[]) => {
        set({ activeDisruptions: disruptions });
      },

      setSimulating: (isSimulating: boolean) => {
        set({ isSimulating });
      },

      setSimulatorResult: (result: SimulationResult | null) => {
        set({ simulatorResult: result });
      },
    }),
    {
      name: "swiftcover-storage", // localStorage key
      partialize: (state) => ({
        // Only persist currentWorkerId
        currentWorkerId: state.currentWorkerId,
      }),
    }
  )
);

// ============================================================================
// Selector Hooks (for optimized re-renders)
// ============================================================================

/**
 * Get current worker ID
 */
export const useCurrentWorkerId = () => useStore((state) => state.currentWorkerId);

/**
 * Get active disruptions
 */
export const useActiveDisruptions = () =>
  useStore((state) => state.activeDisruptions);

/**
 * Get simulator state
 */
export const useSimulator = () =>
  useStore((state) => ({
    result: state.simulatorResult,
    isSimulating: state.isSimulating,
  }));

/**
 * Get worker actions
 */
export const useWorkerActions = () =>
  useStore((state) => ({
    setWorkerId: state.setWorkerId,
    clearWorker: state.clearWorker,
  }));

/**
 * Get disruption actions
 */
export const useDisruptionActions = () =>
  useStore((state) => ({
    setDisruptions: state.setDisruptions,
  }));

/**
 * Get simulator actions
 */
export const useSimulatorActions = () =>
  useStore((state) => ({
    setSimulating: state.setSimulating,
    setSimulatorResult: state.setSimulatorResult,
  }));

export default useStore;
