/**
 * Storage Utilities
 * LocalStorage persistence for player data
 */

import type { PlayerStats } from "../types/player";

const STORAGE_KEY = "math-island-rescue-player";

/**
 * Save player stats to LocalStorage
 * @param stats - PlayerStats to persist
 */
export function savePlayerStats(stats: PlayerStats): void {
  try {
    const serialized = JSON.stringify(stats);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save player stats:", error);
  }
}

/**
 * Load player stats from LocalStorage
 * @returns PlayerStats if found, null otherwise
 */
export function loadPlayerStats(): PlayerStats | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as PlayerStats;
  } catch (error) {
    console.error("Failed to load player stats:", error);
    return null;
  }
}

/**
 * Clear all saved player data from LocalStorage
 */
export function clearPlayerStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear player stats:", error);
  }
}

/**
 * Check if player data exists in LocalStorage
 */
export function hasPlayerStats(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
