import { useState } from 'react';
import { Play, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface ConnectionTestProps {
  connectionId: string | null;
}

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'running' | 'pending';
  message?: string;
  duration?: number;
}

export function ConnectionTest({ connectionId }: ConnectionTestProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([
    { name: 'DNS Resolution', status: 'pending' },
    { name: 'Port Availability', status: 'pending' },
    { name: 'Latency Check', status: 'pending' },
    { name: 'Bandwidth Test', status: 'pending' },
    { name: 'Security Verification', status: 'pending' },
  ]);

  const runTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < results.length; i++) {
      setResults(prev => [
        ...prev.slice(0, i),
        { ...prev[i], status: 'running' },
        ...prev.slice(i + 1),
      ]);

      // Simulate test running
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResults(prev => [
        ...prev.slice(0, i),
        {
          ...prev[i],
          status: Math.random() > 0.2 ? 'success' : 'error',
          duration: Math.floor(Math.random() * 1000),
          message: Math.random() > 0.2
            ? 'Test completed successfully'
            : 'Failed to complete test',
        },
        ...prev.slice(i + 1),
      ]);
    }

    setIsRunning(false);
  };

  if (!connectionId) {
    return (
      <div className="text-center py-12 text-gray-500">
        Select a connection to run tests
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${isRunning
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-brand-blue hover:bg-brand-darkBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue'
            }
          `}
        >
          {isRunning ? (
            <RefreshCw className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <Play className="h-5 w-5 mr-2" />
          )}
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`
              p-4 rounded-lg border
              ${result.status === 'success' ? 'border-green-200 bg-green-50' :
                result.status === 'error' ? 'border-red-200 bg-red-50' :
                result.status === 'running' ? 'border-brand-blue/20 bg-brand-lightBlue' :
                'border-gray-200 bg-gray-50'}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
                {result.status === 'error' && <XCircle className="h-5 w-5 text-red-500 mr-2" />}
                {result.status === 'running' && <RefreshCw className="h-5 w-5 text-brand-blue mr-2 animate-spin" />}
                {result.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-200 mr-2" />}
                <span className="font-medium text-gray-900">{result.name}</span>
              </div>
              {result.duration && (
                <span className="text-sm text-gray-500">
                  {result.duration}ms
                </span>
              )}
            </div>
            {result.message && (
              <p className="mt-1 text-sm text-gray-500 ml-7">
                {result.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}