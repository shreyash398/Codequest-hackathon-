import React from 'react';
import createPlotlyComponentFactory from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const createPlotlyComponent = createPlotlyComponentFactory.default || createPlotlyComponentFactory;
const Plot = createPlotlyComponent(Plotly);

export const PlotlyEfficiencyGraph = () => {
  const xData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Data roughly extracted from the target snapshot
  const areaData = [90, 87, 87, 92, 88, 86, 90];
  const lineData = [70, 60, 86, 64, 65, 67, 60];

  return (
    <div className="w-full h-full relative" style={{ minHeight: '280px' }}>
      <Plot
        data={[
          {
            x: xData,
            y: areaData,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'spline', color: '#10b981', width: 2 }, // Emerald green
            fill: 'tozeroy', // Fills down to x-axis
            fillcolor: 'rgba(16, 185, 129, 0.4)',
            hoverinfo: 'none', // background area, maybe no tooltip
            name: 'Envelope'
          },
          {
            x: xData,
            y: lineData,
            type: 'scatter',
            mode: 'lines+markers',
            line: { shape: 'spline', color: '#3b82f6', width: 3 }, // Blue
            marker: { color: '#3b82f6', size: 6 },
            name: 'Efficiency',
            hoverinfo: 'y'
          }
        ]}
        layout={{
          autosize: true,
          margin: { t: 20, r: 10, l: 30, b: 30 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: false,
          xaxis: {
            color: 'rgba(255,255,255,0.4)',
            showgrid: true,
            gridcolor: 'rgba(255,255,255,0.05)',
            gridwidth: 1,
            griddash: 'dot',
            fixedrange: true, // disable zoom/pan
          },
          yaxis: {
            color: 'rgba(255,255,255,0.4)',
            showgrid: true,
            gridcolor: 'rgba(255,255,255,0.02)',
            gridwidth: 1,
            griddash: 'dot',
            range: [0, 105],
            dtick: 25,
            fixedrange: true,
          },
          hovermode: 'x unified',
          dragmode: false
        }}
        config={{
          displayModeBar: false,
          responsive: true
        }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
      />
    </div>
  );
};
