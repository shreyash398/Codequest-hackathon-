import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';

export const D3EnergyFlow = ({ rawEnergy = [], solarGen = 0 }) => {
  const width = 800; // SVG internal coordinate system width
  const height = 220; // SVG internal coordinate system height
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Derive data
  const dataLen = Math.max(rawEnergy.length, 30);
  const solarGenNum = parseFloat(solarGen) || 0;
  
  // Calculate datasets
  const consumptionData = rawEnergy.map((d, i) => ({ x: i, y: d }));
  const netData = rawEnergy.map((d, i) => ({ x: i, y: solarGenNum - d }));

  // Find y extents
  const minNet = d3.min(netData, d => d.y) || 0;
  const maxCons = d3.max(consumptionData, d => d.y) || 10;
  const defaultMax = Math.max(maxCons, solarGenNum) * 1.2;
  const defaultMin = Math.min(minNet, 0) * 1.2;

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, dataLen - 1])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([-400, 600])
    .range([innerHeight, 0]);

  // Line Generator
  const lineGenerator = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

  const constSolarLine = lineGenerator([{ x: 0, y: solarGenNum }, { x: dataLen - 1, y: solarGenNum }]);
  const consLinePath = lineGenerator(consumptionData);

  // Background Grid calculations
  const yTicks = [-400, -200, 0, 200, 400, 600];
  // We want exactly 9 vertical lines spanning the area
  const xGridTicks = [0, 4, 8, 12, 15, 19, 23, 26, 29];
  const xGridLabels = ['03:25', '03:26', '03:27', '03:28', '03:29', '03:30', '03:31', '03:32', '03:33'];

  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left - margin.left;
    const factor = innerWidth / rect.width; // rough scale mapping if svg scales
    const svgX = xPos * factor; 
    
    // Nearest data index
    const idx = Math.round(xScale.invert(svgX));
    if (idx >= 0 && idx < rawEnergy.length) {
      setHoveredIdx(idx);
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Horizontal Grid */}
          {yTicks.map(t => (
            <g key={t} className="text-white text-[10px] font-sans">
              <line x1={0} x2={innerWidth} y1={yScale(t)} y2={yScale(t)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <text x={-10} y={yScale(t)} textAnchor="end" dominantBaseline="middle" fill="#ffffff">{t}</text>
            </g>
          ))}

          {/* Vertical Grid & Labels */}
          {xGridTicks.map((tick, i) => (
             <g key={tick} className="text-white text-[10px] font-sans">
               <line x1={xScale(tick)} x2={xScale(tick)} y1={0} y2={innerHeight} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
               <text x={xScale(tick)} y={innerHeight + 15} textAnchor="middle" fill="#ffffff">{xGridLabels[i]}</text>
             </g>
          ))}

          {/* Net Energy Bar Chart */}
          {netData.map((d, i) => {
             const y1 = yScale(Math.max(d.y, 0));
             const y2 = yScale(Math.min(d.y, 0));
             const barH = y2 - y1;
             return (
               <rect
                 key={`bar-${i}`}
                 x={xScale(d.x) - (innerWidth / dataLen)*0.25}
                 y={y1}
                 width={(innerWidth / dataLen)*0.5}
                 height={Math.abs(barH) || 0}
                 fill="#3fff8b"
               />
             )
          })}

          {/* Solar Line */}
          <path d={constSolarLine} fill="none" stroke="#ffa84f" strokeWidth={2} />

          {/* Consumption Line */}
          <path d={consLinePath} fill="none" stroke="#44a5ff" strokeWidth={2} />
          
          {/* Points for Consumption */}
          {consumptionData.map((d, i) => (
            <circle key={`pt-${i}`} cx={xScale(d.x)} cy={yScale(d.y)} r={2} fill="#44a5ff" />
          ))}

          {/* Interactive Hover Line */}
          {hoveredIdx !== null && (
            <g>
               <line x1={xScale(hoveredIdx)} x2={xScale(hoveredIdx)} y1={0} y2={innerHeight} stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="2 2" />
               <circle cx={xScale(hoveredIdx)} cy={yScale(consumptionData[hoveredIdx].y)} r={4} fill="#fff" stroke="#44a5ff" strokeWidth={2} />
            </g>
          )}
        </g>
      </svg>

      {/* HTML Tooltip overlay */}
      {hoveredIdx !== null && (
        <div 
          className="absolute bg-black/90 px-3 py-2 rounded shadow-lg text-xs pointer-events-none border border-white/10"
          style={{ 
            left: `${margin.left + (hoveredIdx / dataLen) * 100}%`, 
            top: `10%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-white/60 mb-1 font-bold font-mono">T-{dataLen - hoveredIdx}s</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#44a5ff]"></span><span className="text-white">Consumption: {rawEnergy[hoveredIdx]?.toFixed(2)}</span></div>
          <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 rounded-full bg-[#ffa84f]"></span><span className="text-white">Solar Gen: {solarGenNum?.toFixed(2)}</span></div>
          <div className="flex items-center gap-2 mt-1"><span className="w-2 h-2 bg-[#3fff8b]"></span><span className="text-white">Net Energy: {netData[hoveredIdx]?.y?.toFixed(2)}</span></div>
        </div>
      )}
    </div>
  );
};
