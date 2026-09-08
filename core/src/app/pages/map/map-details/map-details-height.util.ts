/**
 * Calcola l'altezza target del pannello dato l'altezza reale del contenuto,
 * garantendo un minimo (`floor`) e un massimo (`ceiling`).
 */
export function computeTargetHeight(
  contentHeight: number,
  headerHeight: number,
  floor: number,
  ceiling: number,
): number {
  return Math.min(Math.max(contentHeight + headerHeight, floor), ceiling);
}
