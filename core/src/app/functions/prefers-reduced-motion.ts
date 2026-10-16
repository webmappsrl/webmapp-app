/**
 * Vero se l'utente ha chiesto meno movimento nelle impostazioni del telefono o del sistema.
 * @returns `true` con «riduci movimento» attivo
 */
export function prefersReducedMotion(): boolean {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
