import { useId } from 'react';
import { ingredients, mergeLayers, totalMl, type Layer } from './model';

export function Cup({ layers, capacityMl, label }: {
  layers: readonly Layer[]; capacityMl: number; label: string;
}) {
  const id = useId().replace(/:/g, '');
  const merged = mergeLayers(layers);
  let occupied = 0;
  return (
    <svg className="cup" viewBox="0 0 320 280" role="img" aria-labelledby={`${id}-title ${id}-desc`}
      data-capacity={capacityMl} data-filled={totalMl(layers)}>
      <title id={`${id}-title`}>{label}</title>
      <desc id={`${id}-desc`}>
        {totalMl(layers)} of {capacityMl} mL occupied. Bottom to top: {
          merged.length ? merged.map(layer => `${ingredients[layer.ingredient].name} ${layer.amountMl} mL`).join(', ') : 'empty'
        }. {capacityMl - totalMl(layers)} mL remaining.
      </desc>
      <defs>
        <clipPath id={`${id}-inside`}><rect x="66" y="36" width="174" height="184" rx="8" /></clipPath>
        <pattern id={`${id}-foam`} width="12" height="10" patternUnits="userSpaceOnUse">
          <rect width="12" height="10" fill="var(--foam)" />
          <circle cx="3" cy="4" r="1.3" fill="var(--line)" />
          <circle cx="9" cy="8" r="1" fill="var(--line)" />
        </pattern>
      </defs>
      <ellipse cx="157" cy="250" rx="133" ry="17" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <ellipse cx="157" cy="246" rx="98" ry="8" fill="none" stroke="var(--brass)" strokeWidth="2" />
      <path d="M246 72h20c44 0 44 82 0 82h-20" fill="none" stroke="var(--ink)" strokeWidth="12" />
      <path d="M246 72h20c44 0 44 82 0 82h-20" fill="none" stroke="var(--paper)" strokeWidth="6" />
      <rect x="56" y="26" width="194" height="208" rx="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
      <g clipPath={`url(#${id}-inside)`}>
        {merged.map((layer, index) => {
          const height = layer.amountMl / capacityMl * 184;
          occupied += height;
          return <rect key={index} data-layer={layer.ingredient} data-amount={layer.amountMl}
            x="66" y={220 - occupied} width="174" height={height}
            fill={layer.ingredient === 'milk-foam' ? `url(#${id}-foam)` : ingredients[layer.ingredient].color}
            stroke="var(--ink)" strokeWidth="0.8" />;
        })}
      </g>
      <rect x="66" y="36" width="174" height="184" rx="8" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      <path d="M76 30h153" stroke="var(--brass)" strokeWidth="3" />
      {[0, 1, 2, 3, 4].map(mark => <path key={mark} d={`M242 ${36 + mark * 46}h9`}
        stroke="var(--ink)" strokeWidth="2" />)}
    </svg>
  );
}
