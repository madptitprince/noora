export function formatCFA(amount: number | null | undefined): string {
  const value = Number(amount ?? 0);
  // Keep 2 decimals for consistency with previous UI
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} F CFA`;
}
