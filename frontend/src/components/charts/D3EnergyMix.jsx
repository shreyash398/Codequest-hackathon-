import React from 'react';
import * as d3 from 'd3';

export const D3EnergyMix = () => {
  const width = 144; // w-36 is 144px
  const height = 144; 
  
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.80;

  const data = [
    { label: 'Solar', value: 75, color: '#ffa84f' },
    { label: 'Battery', value: 17, color: '#3fff8b' },
    { label: 'Grid', value: 8, color: '#44a5ff' }
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
