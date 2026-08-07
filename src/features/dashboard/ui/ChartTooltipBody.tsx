import type { ChartTooltipBodyRenderContext } from '@tanstack/react-charts/tooltip';

/**
 * Shared tooltip body for TanStack Charts dashboard charts. Renders inside
 * the library's own `.ts-chart-tooltip` box (which already supplies border,
 * background, padding, and shadow), so this only styles the text — adding
 * another bordered card here would double the chrome. Replaces the three
 * near-identical `CustomTooltip` components Recharts required per chart.
 */
export function renderChartTooltipBody(context: ChartTooltipBodyRenderContext<any, any, any>) {
  const { content } = context;

  if (typeof content === 'string') {
    return <p className="text-sm text-muted-foreground">{content}</p>;
  }

  return (
    <div>
      {content.title && <p className="mb-1 font-semibold text-foreground">{content.title}</p>}
      {content.rows.map(row => (
        <p key={row.label} className="text-sm text-muted-foreground">
          {row.label}
          :
          {' '}
          <span className="font-medium text-foreground">{row.value}</span>
        </p>
      ))}
    </div>
  );
}
