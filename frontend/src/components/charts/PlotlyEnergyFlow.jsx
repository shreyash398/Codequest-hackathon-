import React from 'react';
import createPlotlyComponentFactory from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const createPlotlyComponent = createPlotlyComponentFactory.default || createPlotlyComponentFactory;
const Plot = createPlotlyComponent(Plotly);

export const PlotlyEnergyFlow = ({ rawEnergy = [], solarGen = 0 }) => {
  const dataLen = 30;
  const solarGenNum = parseFloat(solarGen) || 0;
  
  // Create indices if history is shorter than dataLen
  const indices = Array.from({ length: rawEnergy.length }, (_, i) => i);
  
  // Net energy calculation
  const netEnergy = rawEnergy.map(val => solarGenNum - val);

  return (
    <div className="w-full h-full relative">
      <Plot
        data={[
          {
            x: indices,
            y: netEnergy,
            type: 'bar',
            name: 'Net Energy',
            marker: {
              color: '#3fff8b',
              opacity: 0.8
            },
            hoverinfo: 'y',
            hovertemplate: 'Net: %{y:.2f} kW<extra></extra>'
          },
          {
            x: indices,
            y: rawEnergy,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Consumption',
            line: { shape: 'spline', color: '#44a5ff', width: 2.5 },
            marker: { color: '#44a5ff', size: 4 },
            hovertemplate: 'Cons: %{y:.2f} kW<extra></extra>'
          },
          {
            x: [0, Math.max(indices.length - 1, dataLen - 1)],
            y: [solarGenNum, solarGenNum],
            type: 'scatter',
            mode: 'lines',
            name: 'Solar Gen',
            line: { color: '#ffa84f', width: 2, dash: 'dash' },
            hovertemplate: 'Solar: %{y:.2f} kW<extra></extra>'
          }
        ]}
        layout={{
          autosize: true,
          margin: { t: 10, r: 10, l: 40, b: 30 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          showlegend: false,
          xaxis: {
            color: 'rgba(255,255,255,0.4)',
            showgrid: true,
            gridcolor: 'rgba(255,255,255,0.05)',
            gridwidth: 1,
            griddash: 'dot',
            fixedrange: true,
            range: [0, dataLen - 1]
          },
          yaxis: {
            color: 'rgba(255,255,255,0.4)',
            showgrid: true,
            gridcolor: 'rgba(255,255,255,0.03)',
            gridwidth: 1,
            griddash: 'dot',
            range: [-400, 600],
            fixedrange: true,
          },
          hovermode: 'x unified',
          dragmode: false,
          hoverlabel: {
            bgcolor: '#1a1a1a',
            bordercolor: '#333',
            font: { color: '#fff', size: 11, family: 'Inter, sans-serif' }
          }
        }}
        config={{
          displayModeBar: false,
          responsive: true
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
