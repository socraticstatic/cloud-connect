import { useEffect, useState, memo } from 'react';

interface LineChartProps {
  data: any;
  options?: any;
}

// Memoized component to prevent unnecessary re-renders
const LineChart = memo(function LineChart({ data, options = {} }: LineChartProps) {
  const [isChartReady, setIsChartReady] = useState(false);
  const [chartComponent, setChartComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadChartJs = async () => {
      try {
        // Only import what we absolutely need
        const [{ Line }, chartModules] = await Promise.all([
          import('react-chartjs-2'),
          import('chart.js/auto') // Auto registration is more efficient
        ]);

        if (!mounted) return;

        // Default options to make chart responsive and fill container
        const defaultOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            }
          },
          ...options
        };

        setChartComponent(<Line data={data} options={defaultOptions} />);
        setIsChartReady(true);
      } catch (error) {
        console.error('Failed to load chart:', error);
        if (mounted) {
          setIsChartReady(true); // Show fallback
        }
      }
    };

    loadChartJs();

    return () => {
      mounted = false;
    };
  }, [data, options]);
  
  if (!isChartReady) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return chartComponent || (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-500">Chart unavailable</span>
    </div>
  );
});

export { LineChart };