'use client';

import { clampMasteryPercent, getMasteryColors, getMasteryDisplay } from '@/utils/vocab-mastery';

const CIRCLE_SIZE = 32;
const CIRCLE_R = 14;
const CIRCLE_STROKE = 3;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function MasteryScoreCell({ score }: Readonly<{ score?: number }>) {
  const percent = clampMasteryPercent(score);
  const { label, kind } = getMasteryDisplay(score);
  const colors = getMasteryColors(kind);
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex shrink-0 items-center justify-center">
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_R}
            fill="none"
            strokeWidth={CIRCLE_STROKE}
            className={colors.track}
          />
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={CIRCLE_R}
            fill="none"
            strokeWidth={CIRCLE_STROKE}
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={colors.progress}
          />
        </svg>
        <span className="absolute text-center text-[10px] font-medium text-foreground tabular-nums">
          {percent % 1 === 0 ? Math.round(percent) : percent.toFixed(1)}
        </span>
      </div>
      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${colors.pill}`}>
        {label}
      </span>
    </div>
  );
}

export { MasteryScoreCell };
export default MasteryScoreCell;
