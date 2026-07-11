import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import LMCCWorkflowVisualization from '../connection/lmcc/LMCCWorkflowVisualization';

export default function AWSWorkflowPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AWS Partner Integration Workflow</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete end-to-end flow from AWS Console to NetBond Advanced provisioning
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LMCCWorkflowVisualization />
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="https://console.aws.amazon.com/directconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                AWS Direct Connect Console →
              </a>
              <button
                onClick={() => navigate('/marketplace', { state: { activeTab: 'aws' } })}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                View AWS Partner Zone →
              </button>
              <button
                onClick={() => navigate('/help')}
                className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Help & Documentation →
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-700 mb-4">
              Our support team is available 24/7 to assist with AWS Direct Connect integration
              and LMCC configuration.
            </p>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">Email:</span>{' '}
                <a href="mailto:support@att.com" className="text-blue-600 hover:underline">
                  support@att.com
                </a>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Phone:</span>{' '}
                <span className="text-gray-900">1-800-ATT-HELP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
