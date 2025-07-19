import React, { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { BarChart3, LineChart, PieChart, Zap, Download, Code, Settings, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ChartData {
  id: string;
  type: string;
  title: string;
  data: any[];
  layout: any;
  config: any;
  createdAt: Date;
}

const CHART_TEMPLATES = {
  line: {
    title: 'Line Chart',
    icon: LineChart,
    data: [{
      x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      y: [20, 14, 23, 25, 22, 16],
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Sales',
      line: { color: '#3b82f6' }
    }],
    layout: {
      title: 'Monthly Sales Trend',
      xaxis: { title: 'Month' },
      yaxis: { title: 'Sales ($k)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#f3f4f6' }
    }
  },
  bar: {
    title: 'Bar Chart',
    icon: BarChart3,
    data: [{
      x: ['Product A', 'Product B', 'Product C', 'Product D'],
      y: [20, 14, 23, 25],
      type: 'bar',
      marker: {
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      }
    }],
    layout: {
      title: 'Product Performance',
      xaxis: { title: 'Products' },
      yaxis: { title: 'Revenue ($k)' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#f3f4f6' }
    }
  },
  pie: {
    title: 'Pie Chart',
    icon: PieChart,
    data: [{
      values: [30, 25, 20, 15, 10],
      labels: ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Other'],
      type: 'pie',
      marker: {
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
    }],
    layout: {
      title: 'Device Usage Distribution',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#f3f4f6' }
    }
  },
  scatter: {
    title: 'Scatter Plot',
    icon: Zap,
    data: [{
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [2, 4, 3, 8, 7, 10, 12, 9, 11, 15],
      mode: 'markers',
      type: 'scatter',
      name: 'Data Points',
      marker: {
        color: '#3b82f6',
        size: 8
      }
    }],
    layout: {
      title: 'Correlation Analysis',
      xaxis: { title: 'Variable X' },
      yaxis: { title: 'Variable Y' },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#f3f4f6' }
    }
  }
};

function VisualizationPanel() {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCode, setEditingCode] = useState('');

  const createChart = useCallback((templateKey: keyof typeof CHART_TEMPLATES) => {
    const template = CHART_TEMPLATES[templateKey];
    const newChart: ChartData = {
      id: crypto.randomUUID(),
      type: templateKey,
      title: template.title,
      data: template.data,
      layout: template.layout,
      config: {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
        responsive: true
      },
      createdAt: new Date()
    };
    
    setCharts(prev => [newChart, ...prev]);
    setSelectedChart(newChart.id);
    setShowTemplates(false);
    toast.success(`${template.title} created!`);
  }, []);

  const deleteChart = useCallback((chartId: string) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
    if (selectedChart === chartId) {
      setSelectedChart(null);
    }
    toast.success('Chart deleted');
  }, [selectedChart]);

  const downloadChart = useCallback((chart: ChartData) => {
    // In a real implementation, this would use Plotly's downloadImage
    const dataStr = JSON.stringify({
      data: chart.data,
      layout: chart.layout
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chart data downloaded');
  }, []);

  const editChart = useCallback((chart: ChartData) => {
    const code = JSON.stringify({ data: chart.data, layout: chart.layout }, null, 2);
    setEditingCode(code);
    setIsEditing(true);
  }, []);

  const saveEdit = useCallback(() => {
    try {
      const parsed = JSON.parse(editingCode);
      if (selectedChart) {
        setCharts(prev => prev.map(chart => 
          chart.id === selectedChart 
            ? { ...chart, data: parsed.data, layout: parsed.layout }
            : chart
        ));
        toast.success('Chart updated!');
      }
    } catch (error) {
      toast.error('Invalid JSON format');
    }
    setIsEditing(false);
  }, [editingCode, selectedChart]);

  const selectedChartData = charts.find(chart => chart.id === selectedChart);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-3 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-white">Visualizations</h3>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {charts.length} chart{charts.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105"
            >
              <BarChart3 className="w-4 h-4" />
              <span>New Chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Templates Dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-800 bg-gray-800/50"
          >
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Choose a chart type:</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CHART_TEMPLATES).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => createChart(key as keyof typeof CHART_TEMPLATES)}
                      className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                    >
                      <Icon className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{template.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Charts List */}
        {charts.length > 0 && (
          <div className="w-64 border-r border-gray-800 bg-gray-900/30">
            <div className="p-3 border-b border-gray-800">
              <h4 className="text-sm font-medium text-gray-300">Charts</h4>
            </div>
            <div className="overflow-y-auto max-h-full">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className={`p-3 border-b border-gray-800 cursor-pointer transition-colors ${
                    selectedChart === chart.id ? 'bg-blue-900/30' : 'hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedChart(chart.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-white truncate">{chart.title}</h5>
                      <p className="text-xs text-gray-400 capitalize">{chart.type} chart</p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editChart(chart);
                        }}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Edit chart"
                      >
                        <Code className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadChart(chart);
                        }}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Download chart"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Display Area */}
        <div className="flex-1 relative">
          {isEditing ? (
            <div className="h-full flex flex-col">
              <div className="border-b border-gray-800 p-3 bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">Edit Chart Data</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={editingCode}
                  onChange={(e) => setEditingCode(e.target.value)}
                  className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Edit chart configuration (JSON format)"
                />
              </div>
            </div>
          ) : selectedChartData ? (
            <div className="h-full p-4">
              <div className="h-full bg-gray-800 rounded-lg">
                <Plot
                  data={selectedChartData.data}
                  layout={{
                    ...selectedChartData.layout,
                    autosize: true,
                    margin: { l: 50, r: 50, t: 50, b: 50 }
                  }}
                  config={selectedChartData.config}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler={true}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {charts.length === 0 ? 'No Charts Yet' : 'Select a Chart'}
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  {charts.length === 0 
                    ? 'Create your first visualization by clicking "New Chart" above.'
                    : 'Choose a chart from the sidebar to view and interact with it.'
                  }
                </p>
                {charts.length === 0 && (
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Chart
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisualizationPanel;