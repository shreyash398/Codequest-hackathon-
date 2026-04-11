import React from 'react';
import createPlotlyComponentFactory from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist';

const createPlotlyComponent = createPlotlyComponentFactory.default || createPlotlyComponentFactory;
const Plot = createPlotlyComponent(Plotly);

export const HistoricalTrendChart = ({ data, range }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted gap-3">
        <span className="material-symbols-outlined text-4xl opacity-20">database_off</span>
        <p className="text-xs font-bold tracking-widest uppercase opacity-40">No historical data available for this range</p>
      </div>
    );
  }

  const times = data.map(d => d.time);
  const values = data.map(d => d.value);

  const plotData = [
    {
      x: times,
      y: values,
      type: 'scatter',
      mode: 'lines',
      name: 'Energy Consumption',
      line: {
        color: '#3fff8b',
        width: 3,
        shape: 'spline'
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(63, 255, 139, 0.05)',
    }
  ];

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 10, r: 10, b: 40, l: 40 },
    xaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      tickfont: { color: 'rgba(255,255,255,0.3)', size: 10 },
      autorange: true
    },
    yaxis: {
      gridcolor: 'rgba(255,255,255,0.05)',
      tickfont: { color: 'rgba(255,255,255,0.3)', size: 10 },
      title: { text: 'Generation (GWh/kW)', font: { color: 'rgba(255,255,255,0.3)', size: 10 } }
    },
    showlegend: false,
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#1a1a1a',
      bordercolor: '#3fff8b',
      font: { color: '#fff', family: 'Inter' }
    }
  };

  return (
    <div className="w-full h-full">
      <Plot
        data={plotData}
        layout={layout}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false, responsive: true }}
      />
    </div>
  );
};
