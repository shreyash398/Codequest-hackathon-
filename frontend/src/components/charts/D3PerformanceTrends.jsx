import React, { useState } from 'react';
import * as d3 from 'd3';

export const D3PerformanceTrends = ({ liveLine = 94, liveBar = 39 }) => {
  const width = 800;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const data = [
    { day: 'Mon', line: 88, bar: 40 },
    { day: 'Tue', line: 94, bar: 39 },
    { day: 'Wed', line: 87, bar: 44 },
    { day: 'Thu', line: 91, bar: 37 },
    { day: 'Fri', line: 93, bar: 35 },
    { day: 'Sat', line: 90, bar: 40 },
    { day: 'Sun', line: parseFloat(liveLine) || 94, bar: (parseFloat(liveBar) % 40) + 10 },
  ];

  // Scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.day))
    .range([0, innerWidth])
    .padding(0.6); // Makes the bars thin

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0]);

  const yTicks = [0, 25, 50, 75, 100];

  // Colors based on the screenshot
  const colors = { line: '#3fff8b', bar: '#ffa84f' };

  // Line Generator
  const lineGenerator = d3.line()
    .x(d => xScale(d.day) + xScale.bandwidth() / 2)
    .y(d => yScale(d.line))
    .curve(d3.curveMonotoneX);
    
  // Connect the line across all days to show the real-time Sunday tick
  const linePath = lineGenerator(data);

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
          
          {/* Vertical subtle grid lines matching X Axis centers */}
          {data.map(d => (
            <line 
               key={`vgrid-${d.day}`}
               x1={xScale(d.day) + xScale.bandwidth() / 2} 
               x2={xScale(d.day) + xScale.bandwidth() / 2} 
               y1={0} 
               y2={innerHeight} 
               stroke="rgba(255,255,255,0.03)" 
               strokeDasharray="4 4" 
            />
          ))}

          {/* X Axis */}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="rgba(255,255,255,0.2)" />
          {data.map(d => (
            <text 
              key={`label-${d.day}`} 
              x={xScale(d.day) + xScale.bandwidth() / 2} 
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
             <g key={i}>
               <rect 
                  x={xScale(d.day) - 20} y={0} width={xScale.bandwidth() + 40} height={innerHeight} fill="transparent" 
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverData({ x: rect.left + rect.width/2, ...d });
                  }}
                  onMouseLeave={() => setHoverData(null)}
               />
               <rect
                 x={xScale(d.day)}
                 y={yScale(d.bar)}
                 width={xScale.bandwidth()}
                 height={innerHeight - yScale(d.bar)}
                 fill={colors.bar}
                 className="pointer-events-none"
               />
             </g>
          ))}

          {/* Line string */}
          <path d={linePath} fill="none" stroke={colors.line} strokeWidth={2} />
          
          {/* Line points */}
          {data.map((d, i) => (
            <circle 
              key={`pt-${i}`} 
              cx={xScale(d.day) + xScale.bandwidth() / 2} 
              cy={yScale(d.line)} 
              r={3} 
              fill={colors.line} 
              className="pointer-events-none"
            />
          ))}
        </g>
      </svg>
      
      {/* Tooltip */}
      {hoverData && (
         <div 
           className="fixed bg-black/90 px-3 py-2 rounded shadow-lg text-xs pointer-events-none border border-white/10 z-50 transform -translate-x-1/2 -translate-y-full mt-[-10px]"
           style={{ left: hoverData.x, top: window.innerHeight * 0.3 }}
         >
           <div className="text-white font-bold mb-1">{hoverData.day}</div>
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3fff8b]"></span><span className="text-white">Trend: {hoverData.line}%</span></div>
           <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-[#ffa84f]"></span><span className="text-white">Volume: {hoverData.bar}</span></div>
         </div>
      )}
    </div>
  );
};
