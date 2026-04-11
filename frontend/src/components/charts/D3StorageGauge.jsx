import React from 'react';
import * as d3 from 'd3';

export const D3StorageGauge = ({ percent = 0 }) => {
  const width = 112; // 28 * 4 (Tailwind w-28 is 112px)
  const height = 112; 
  
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.85;

  const data = [
    { value: percent, color: '#3fff8b' },
    { value: 100 - percent, color: '#0a1932' }
  ];

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const arcs = pie(data);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <g transform={`translate(${width/2},${height/2})`}>
        {arcs.map((d, i) => (
          <path
            key={i}
            d={arc(d)}
            fill={d.data.color}
          />
        ))}
      </g>
    </svg>
  );
};
