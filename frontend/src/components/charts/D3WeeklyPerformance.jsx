import React, { useState } from 'react';
import * as d3 from 'd3';

export const D3WeeklyPerformance = () => {
  const width = 600;
  const height = 160;
  const margin = { top: 10, right: 10, bottom: 20, left: 30 };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const data = [
    { day: 'Sat', solar: 42, grid: 48 },
    { day: 'Sun', solar: 44, grid: 44 },
    { day: 'Mon', solar: 38, grid: 49 },
    { day: 'Tue', solar: 39, grid: 45 },
    { day: 'Wed', solar: 44, grid: 45 },
    { day: 'Thu', solar: 34, grid: 40 },
    { day: 'Fri', solar: 46, grid: 50 },
  ];

  // Scales
  const x0 = d3.scaleBand()
    .domain(data.map(d => d.day))
    .range([0, innerWidth])
    .paddingInner(0.2);

  const x1 = d3.scaleBand()
    .domain(['solar', 'grid'])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const yScale = d3.scaleLinear()
    .domain([0, 60])
    .range([innerHeight, 0]);

  const yTicks = [0, 15, 30, 45, 60];

  const colors = { solar: '#ffa84f', grid: '#44a5ff' };

  const [hoverData, setHoverData] = useState(null);

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y Axis Grid */}
          {yTicks.map(t => (
            <g key={t} className="text-white text-[10px] font-sans">
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <text x={-10} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fill="#ffffff">{t}</text>
            </g>
          ))}

          {/* X Axis */}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="rgba(255,255,255,0.2)" />
          {data.map(d => (
            <text 
              key={`label-${d.day}`} 
              x={x0(d.day) + x0.bandwidth() / 2} 
              y={innerHeight + 15} 
              textAnchor="middle" 
              className="text-white text-[10px] font-sans"
              fill="#ffffff"
            >
              {d.day}
            </text>
          ))}

          {/* Bars */}
          {data.map((d, i) => (
             <g key={i} transform={`translate(${x0(d.day)},0)`}>
               {/* Invisible rect for hovering the exact day group */}
               <rect 
                  x={0} y={0} width={x0.bandwidth()} height={innerHeight} fill="transparent" 
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverData({ x: rect.left + rect.width/2, ...d });
                  }}
                  onMouseLeave={() => setHoverData(null)}
               />
               <rect
                 x={x1('solar')}
                 y={yScale(d.solar)}
                 width={x1.bandwidth()}
                 height={innerHeight - yScale(d.solar)}
                 fill={colors.solar}
                 rx={2}
                 className="pointer-events-none"
               />
               <rect
                 x={x1('grid')}
                 y={yScale(d.grid)}
                 width={x1.bandwidth()}
                 height={innerHeight - yScale(d.grid)}
                 fill={colors.grid}
                 rx={2}
                 className="pointer-events-none"
               />
             </g>
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoverData && (
         <div 
           className="fixed bg-black/90 px-3 py-2 rounded shadow-lg text-xs pointer-events-none border border-white/10 z-50 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
           style={{ left: hoverData.x, top: window.innerHeight * 0.4 }}
         >
           <div className="text-white font-bold mb-1">{hoverData.day}</div>
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ffa84f]"></span><span className="text-white">Solar: {hoverData.solar}</span></div>
           <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-[#44a5ff]"></span><span className="text-white">Grid: {hoverData.grid}</span></div>
         </div>
      )}
    </div>
  );
};
