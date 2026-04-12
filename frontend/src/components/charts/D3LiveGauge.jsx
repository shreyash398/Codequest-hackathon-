import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

/**
 * Animated radial gauge with color-coded threshold zones.
 * Props:
 *   value    - current reading
 *   min      - minimum scale value (default 0)
 *   max      - maximum scale value
 *   label    - gauge title
 *   unit     - unit suffix (kW, %, etc.)
 *   thresholds - { warn: number, critical: number } (percentages of max)
 */
export const D3LiveGauge = ({ value = 0, min = 0, max = 100, label = '', unit = '', thresholds }) => {
  const svgRef = useRef(null);
  const prevValueRef = useRef(value);

  const defaultThresholds = thresholds || { warn: max * 0.6, critical: max * 0.85 };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 180;
    const height = 120;
    const cx = width / 2;
    const cy = height - 10;
    const radius = 70;
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const angleRange = endAngle - startAngle;

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${cx}, ${cy})`);

    // Background arc
    const bgArc = d3.arc()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(5);

    g.append('path')
      .attr('d', bgArc())
      .attr('fill', 'rgba(255,255,255,0.06)');

    // Threshold zone arcs
    const zones = [
      { start: 0, end: defaultThresholds.warn, color: '#3fff8b' },
      { start: defaultThresholds.warn, end: defaultThresholds.critical, color: '#ffa84f' },
      { start: defaultThresholds.critical, end: max, color: '#ff716c' },
    ];

    zones.forEach(zone => {
      const zoneStart = startAngle + (zone.start / max) * angleRange;
      const zoneEnd = startAngle + (Math.min(zone.end, max) / max) * angleRange;
      const zoneArc = d3.arc()
        .innerRadius(radius - 3)
        .outerRadius(radius - 1)
        .startAngle(zoneStart)
        .endAngle(zoneEnd);
      g.append('path')
        .attr('d', zoneArc())
        .attr('fill', zone.color)
        .attr('opacity', 0.3);
    });

    // Determine active color
    const clampedVal = Math.max(min, Math.min(value, max));
    let activeColor = '#3fff8b';
    if (clampedVal >= defaultThresholds.critical) activeColor = '#ff716c';
    else if (clampedVal >= defaultThresholds.warn) activeColor = '#ffa84f';

    // Animated value arc
    const prevClamped = Math.max(min, Math.min(prevValueRef.current, max));
    const prevAngle = startAngle + (prevClamped / max) * angleRange;
    const targetAngle = startAngle + (clampedVal / max) * angleRange;

    const valueArc = d3.arc()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(startAngle)
      .cornerRadius(5);

    const valuePath = g.append('path')
      .datum({ endAngle: prevAngle })
      .attr('d', valueArc)
      .attr('fill', activeColor);

    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'gaugeGlow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    valuePath.attr('filter', 'url(#gaugeGlow)');

    // Animate arc
    valuePath.transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attrTween('d', function() {
        const interp = d3.interpolate(this._current || prevAngle, targetAngle);
        this._current = targetAngle;
        return function(t) {
          return valueArc({ endAngle: interp(t) });
        };
      });

    // Needle
    const needleAngle = targetAngle;
    const needleLen = radius - 18;
    g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', -needleLen)
      .attr('stroke', activeColor)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.8)
      .attr('transform', `rotate(${(needleAngle * 180) / Math.PI})`);

    // Center dot
    g.append('circle')
      .attr('cx', 0).attr('cy', 0).attr('r', 4)
      .attr('fill', activeColor)
      .attr('opacity', 0.9);

    // Tick marks
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const tickAngle = startAngle + (i / tickCount) * angleRange;
      const innerR = radius + 4;
      const outerR = radius + 10;
      g.append('line')
        .attr('x1', innerR * Math.cos(tickAngle - Math.PI / 2))
        .attr('y1', innerR * Math.sin(tickAngle - Math.PI / 2))
        .attr('x2', outerR * Math.cos(tickAngle - Math.PI / 2))
        .attr('y2', outerR * Math.sin(tickAngle - Math.PI / 2))
        .attr('stroke', 'rgba(255,255,255,0.15)')
        .attr('stroke-width', 1);

      const labelR = radius + 18;
      const tickVal = min + (i / tickCount) * (max - min);
      g.append('text')
        .attr('x', labelR * Math.cos(tickAngle - Math.PI / 2))
        .attr('y', labelR * Math.sin(tickAngle - Math.PI / 2))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'rgba(255,255,255,0.25)')
        .attr('font-size', '7px')
        .attr('font-family', 'Outfit, sans-serif')
        .text(Math.round(tickVal));
    }

    prevValueRef.current = value;
  }, [value, min, max, defaultThresholds]);

  // Determine active color for text
  const clampedVal = Math.max(min, Math.min(value, max));
  let textColor = '#3fff8b';
  if (clampedVal >= defaultThresholds.critical) textColor = '#ff716c';
  else if (clampedVal >= defaultThresholds.warn) textColor = '#ffa84f';

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} className="w-full max-w-[180px]" />
      <div className="text-center -mt-2">
        <span className="text-2xl font-black font-headline" style={{ color: textColor }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs text-muted ml-1">{unit}</span>
      </div>
      <span className="text-[9px] text-muted uppercase tracking-widest font-bold mt-1">{label}</span>
    </div>
  );
};
