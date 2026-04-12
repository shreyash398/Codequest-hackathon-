import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

/**
 * D3 Forecast Chart with animated line and confidence band.
 * Props:
 *   data     - array of { hour, predicted, upper, lower }
 *   horizon  - '24h' or '7d'
 */
export const D3ForecastChart = ({ data = [], horizon = '24h' }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 600, height: 300 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDims({ width: Math.max(width, 300), height: Math.max(height, 200) });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 35, left: 50 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    const g = svg
      .attr('viewBox', `0 0 ${dims.width} ${dims.height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, w]);

    const yMin = d3.min(data, d => d.lower) * 0.9;
    const yMax = d3.max(data, d => d.upper) * 1.1;
    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([h, 0]);

    // Grid lines
    const yTicks = yScale.ticks(5);
    yTicks.forEach(tick => {
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', yScale(tick)).attr('y2', yScale(tick))
        .attr('stroke', 'rgba(255,255,255,0.04)')
        .attr('stroke-dasharray', '4,4');
    });

    // Confidence band (area)
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(d => yScale(d.lower))
      .y1(d => yScale(d.upper))
      .curve(d3.curveMonotoneX);

    // Gradient for confidence band
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'confidenceGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#ffa84f').attr('stop-opacity', 0.15);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ffa84f').attr('stop-opacity', 0.02);

    g.append('path')
      .datum(data)
      .attr('d', area)
      .attr('fill', 'url(#confidenceGrad)');

    // Upper bound line (dashed)
    const upperLine = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.upper))
      .curve(d3.curveMonotoneX);
    g.append('path')
      .datum(data)
      .attr('d', upperLine)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,168,79,0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Lower bound line (dashed)
    const lowerLine = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.lower))
      .curve(d3.curveMonotoneX);
    g.append('path')
      .datum(data)
      .attr('d', lowerLine)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,168,79,0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Predicted line (main)
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.predicted))
      .curve(d3.curveMonotoneX);

    // Glow filter
    const glowFilter = defs.append('filter').attr('id', 'forecastGlow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const path = g.append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#ffa84f')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#forecastGlow)');

    // Animate line drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Data points
    data.forEach((d, i) => {
      if (i % Math.max(1, Math.floor(data.length / 12)) === 0 || i === data.length - 1) {
        g.append('circle')
          .attr('cx', xScale(i))
          .attr('cy', yScale(d.predicted))
          .attr('r', 3)
          .attr('fill', '#0a1628')
          .attr('stroke', '#ffa84f')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0)
          .transition()
          .delay(1500)
          .duration(300)
          .attr('opacity', 1);
      }
    });

    // X-axis
    const xAxis = g.append('g').attr('transform', `translate(0, ${h})`);
    const labelInterval = Math.max(1, Math.floor(data.length / 8));
    data.forEach((d, i) => {
      if (i % labelInterval === 0 || i === data.length - 1) {
        xAxis.append('text')
          .attr('x', xScale(i))
          .attr('y', 22)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(255,255,255,0.3)')
          .attr('font-size', '9px')
          .attr('font-family', 'Outfit, sans-serif')
          .text(d.hour);
      }
    });

    // Y-axis
    yTicks.forEach(tick => {
      g.append('text')
        .attr('x', -10)
        .attr('y', yScale(tick))
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'rgba(255,255,255,0.3)')
        .attr('font-size', '9px')
        .attr('font-family', 'Outfit, sans-serif')
        .text(tick.toFixed(1));
    });

    // Hover tooltip
    const tooltip = g.append('g').style('display', 'none');
    tooltip.append('line')
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-dasharray', '3,3');
    const tooltipBg = tooltip.append('rect')
      .attr('fill', 'rgba(10,22,40,0.95)')
      .attr('rx', 6).attr('ry', 6)
      .attr('width', 120).attr('height', 50)
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 0.5);
    const tooltipText1 = tooltip.append('text').attr('fill', '#ffa84f').attr('font-size', '10px').attr('font-family', 'Outfit');
    const tooltipText2 = tooltip.append('text').attr('fill', 'rgba(255,255,255,0.5)').attr('font-size', '9px').attr('font-family', 'Outfit');

    g.append('rect')
      .attr('width', w).attr('height', h)
      .attr('fill', 'transparent')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        const idx = Math.round(xScale.invert(mx));
        if (idx >= 0 && idx < data.length) {
          const d = data[idx];
          tooltip.style('display', null);
          tooltip.select('line').attr('x1', xScale(idx)).attr('x2', xScale(idx));
          tooltipBg.attr('x', xScale(idx) + 8).attr('y', yScale(d.predicted) - 30);
          tooltipText1.attr('x', xScale(idx) + 16).attr('y', yScale(d.predicted) - 12).text(`${d.predicted.toFixed(2)} kW`);
          tooltipText2.attr('x', xScale(idx) + 16).attr('y', yScale(d.predicted) + 4).text(`±${((d.upper - d.lower) / 2).toFixed(2)} kW range`);
        }
      })
      .on('mouseout', () => tooltip.style('display', 'none'));

  }, [data, dims]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
