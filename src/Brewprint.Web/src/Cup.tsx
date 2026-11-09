import { useId, useLayoutEffect, useRef, useState } from 'react';
import { ingredientIds, ingredients, mergeLayers, totalMl, type Layer } from './model';

export function Cup({ layers, capacityMl, label }: {
  layers: readonly Layer[]; capacityMl: number; label: string;
}) {
  const id = useId().replace(/:/g, '');
  const merged = mergeLayers(layers);
  const illustration = useRef<HTMLDivElement>(null);
  const glass = useRef<SVGSVGElement>(null);
  const labels = useRef<HTMLOListElement>(null);
  const [geometry, setGeometry] = useState({ width: 760, height: 361.25, x: 210, y: 0, scale: 340 / 320, labelWidth: 190 });

  useLayoutEffect(() => {
    const root = illustration.current;
    const svg = glass.current;
    const list = labels.current;
    if (!root || !svg || !list) return;
    const measure = () => {
      const frame = root.getBoundingClientRect();
      const cup = svg.getBoundingClientRect();
      setGeometry({ width: frame.width, height: frame.height, x: cup.x - frame.x,
        y: cup.y - frame.y, scale: cup.width / 320, labelWidth: list.getBoundingClientRect().width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(svg);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  let occupied = 0;
  const segments = merged.map(layer => {
    const height = layer.amountMl / capacityMl * 184;
    occupied += height;
    return { ...layer, height, y: 220 - occupied };
  });
  const topToBottom = [...segments].reverse();
  // Keep thin and repeated layers legible without changing their actual fill.
  let previousY = -14;
  let nextY = geometry.height + 14;
  const labelPositions = topToBottom.map(layer => {
    previousY = Math.max(geometry.y + (layer.y + layer.height / 2 + 60) * geometry.scale, previousY + 28);
    return previousY;
  }).reverse().map(position => {
    nextY = Math.min(position, nextY - 28);
    return nextY;
  }).reverse();

  return <div className="cup-illustration" ref={illustration}
    style={{ minHeight: `${merged.length * 28}px` }}>
    <svg className="cup-leaders" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
      {topToBottom.map((layer, index) => {
        const x = geometry.x + 66 * geometry.scale;
        const y = geometry.y + (layer.y + layer.height / 2 + 60) * geometry.scale;
        return <g key={`${index}-${layer.ingredient}`}>
          <path d={`M${x} ${y}h-12L${geometry.labelWidth + 16} ${labelPositions[index]}h-8`} />
          <circle cx={x} cy={y} r="2.5" />
        </g>;
      })}
    </svg>
    <ol ref={labels} className="cup-labels" aria-hidden="true">
      {topToBottom.map((layer, index) => <li key={`${index}-${layer.ingredient}`}
        className="cup-label" data-callout={layer.ingredient} data-amount={layer.amountMl}
        style={{ top: `${labelPositions[index]}px` }}>
        <span>{ingredients[layer.ingredient].name}</span>
        <span className="cup-label-amount">{layer.amountMl} mL</span>
      </li>)}
    </ol>
    <svg ref={glass} className="cup" viewBox="0 -60 320 340" role="img" aria-labelledby={`${id}-title ${id}-desc`}
    data-capacity={capacityMl} data-filled={totalMl(layers)}>
    <title id={`${id}-title`}>{label}</title>
    <desc id={`${id}-desc`}>{totalMl(layers)} of {capacityMl} mL occupied. Bottom to top: {
      merged.length ? merged.map(layer => `${ingredients[layer.ingredient].name} ${layer.amountMl} mL`).join(', ') : 'empty'
    }. {capacityMl - totalMl(layers)} mL remaining.</desc>
    <defs>
      <clipPath id={`${id}-inside`}><rect x="66" y="36" width="174" height="184" rx="8" /></clipPath>
      <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="var(--glass)" stopOpacity=".17" />
        <stop offset=".45" stopColor="var(--glass)" stopOpacity=".025" />
        <stop offset="1" stopColor="var(--glass)" stopOpacity=".13" />
      </linearGradient>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="var(--glass)" /><stop offset=".35" stopColor="var(--brass)" />
        <stop offset=".7" stopColor="var(--surface)" /><stop offset="1" stopColor="var(--brass)" />
      </linearGradient>
      <linearGradient id={`${id}-shine`}>
        <stop stopColor="var(--ink)" stopOpacity=".25" />
        <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-shadow`}><stop stopColor="#000" stopOpacity=".65" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      {ingredientIds.map(ingredient => <linearGradient key={ingredient} id={`${id}-${ingredient}`}>
        <stop stopColor={ingredients[ingredient].color} stopOpacity=".76" />
        <stop offset=".35" stopColor={ingredients[ingredient].color} />
        <stop offset="1" stopColor={ingredients[ingredient].color} stopOpacity=".83" />
      </linearGradient>)}
      <pattern id={`${id}-foam`} width="12" height="10" patternUnits="userSpaceOnUse">
        <rect width="12" height="10" fill="var(--foam)" />
        <circle cx="3" cy="4" r="1.3" fill="var(--milk)" />
        <circle cx="9" cy="8" r="1" fill="var(--milk)" />
      </pattern>
    </defs>
    <ellipse cx="157" cy="264" rx="145" ry="14" fill={`url(#${id}-shadow)`} />
    <g className="cup-object">
      <g className="steam" aria-hidden="true">
        <path className="steam-trail" d="M124 15c-16-20 17-26 3-50" />
        <path className="steam-trail" d="M157 10c-17-24 18-32 3-59" />
        <path className="steam-trail" d="M190 15c-14-21 17-28 3-48" />
      </g>
      <ellipse cx="157" cy="250" rx="133" ry="15" fill="var(--surface)" stroke={`url(#${id}-metal)`} strokeWidth="2" />
      <ellipse cx="157" cy="245" rx="106" ry="9" fill={`url(#${id}-glass)`} stroke="var(--brass)" strokeOpacity=".55" />
      <path d="M246 69h18c44 0 44 84 0 84h-18" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="11" />
      <path d="M246 69h18c44 0 44 84 0 84h-18" fill="none" stroke="var(--paper)" strokeWidth="5" />
      <rect x="56" y="26" width="194" height="208" rx="18" fill={`url(#${id}-glass)`} stroke="var(--glass)" strokeOpacity=".65" strokeWidth="2.5" />
      <g key={label} clipPath={`url(#${id}-inside)`} className="liquid-layers">
        {segments.map((layer, index) => {
          return <g className="pour-layer" key={`${index}-${layer.ingredient}`} style={{ animationDelay: `${index * 90}ms` }}>
            <rect className="liquid-layer" data-layer={layer.ingredient} data-amount={layer.amountMl}
              x="66" y={layer.y} width="174" height={layer.height}
              fill={`url(#${id}-${layer.ingredient === 'milk-foam' ? 'foam' : layer.ingredient})`} />
            <path d={`M66 ${layer.y + .5}h174`} stroke="var(--ink)" strokeOpacity=".22" strokeWidth="1" />
          </g>;
        })}
      </g>
      <rect x="66" y="36" width="174" height="184" rx="8" fill="none" stroke="var(--glass)" strokeOpacity=".25" />
      <path d="M73 44v157q0 13 13 13" fill="none" stroke={`url(#${id}-shine)`} strokeWidth="7" strokeLinecap="round" />
      <path d="M230 47v148" fill="none" stroke="var(--ink)" strokeOpacity=".08" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="153" cy="32" rx="90" ry="6" fill="none" stroke="var(--glass)" strokeWidth="1.5" strokeOpacity=".75" />
      <path d="M86 232h134" stroke="var(--glass)" strokeWidth="3" strokeOpacity=".35" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map(mark => <path key={mark} d={`M240 ${36 + mark * 46}h8`}
        stroke="var(--glass)" strokeOpacity=".5" strokeWidth="1" />)}
    </g>
    </svg>
  </div>;
}
