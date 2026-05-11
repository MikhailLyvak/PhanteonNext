/**
 * Pure preset-selection helper. Spec §4.7 (selection algorithm) and §6.2
 * (used during Phase B robot creation).
 *
 * Algorithm:
 *   1. Filter by exchange.
 *   2. Filter by `min_deposit <= deposit`.
 *   3. Return the entry with the HIGHEST `min_deposit`, or `null`.
 *
 * Returns `null` when no preset qualifies — callers (RobotCreationForm) MUST
 * handle this and block submission with an inline "deposit too low" error.
 */
import type { SettingsPreset } from "./types";

export const selectPreset = (
  presets: SettingsPreset[],
  exchange: string,
  deposit: number
): SettingsPreset | null => {
  if (!Array.isArray(presets) || presets.length === 0) return null;
  if (!Number.isFinite(deposit)) return null;

  const candidates = presets.filter(
    (p) => p.exchange === exchange && p.min_deposit <= deposit
  );

  if (candidates.length === 0) return null;

  return candidates.reduce((best, current) =>
    current.min_deposit > best.min_deposit ? current : best
  );
};
