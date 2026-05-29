export function getMasteryTextClass(score: number): string {
  if (score < 4) {
    return 'text-destructive';
  }
  if (score < 7) {
    return 'text-warning';
  }
  return 'text-success';
}

export function getMasteryBarClass(score: number): string {
  if (score < 4) {
    return 'bg-destructive';
  }
  if (score < 7) {
    return 'bg-warning';
  }
  return 'bg-success';
}
