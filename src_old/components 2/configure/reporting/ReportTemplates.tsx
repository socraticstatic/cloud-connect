import { useState } from 'react';
import { FileText, Edit, Trash2, Copy, Download } from 'lucide-react';
import { Button } from '../../common/Button';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'Performance' | 'Security' | 'Usage' | 'Custom';
  lastModified: string;
  format: 'PDF' | 'CSV' | 'Excel';
}

export function ReportTemplates() {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'Monthly Performance Report',
      description: 'Comprehensive NetBond connection utilization metrics per IPE site with bandwidth analysis',
      type: 'Performance',
      lastModified: '2024-03-10T15:30:00Z',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Security Audit Log',
      description: 'Detailed NetBond connection access logs, security events, and compliance status',
      type: 'Security',
      lastModified: '2024-03-09T12:45:00Z',
      format: 'CSV'
    },
    {
      id: '3',
      name: 'Bandwidth Usage Analysis',
      description: 'NetBond connection types, utilization per IPE, link status, and bandwidth consumption trends',
      type: 'Usage',
      lastModified: '2024-03-08T09:15:00Z',
      format: 'Excel'
    }
  ]);

  const getTypeColor = (type: Template['type']) => {
    switch (type) {
      case 'Performance':
        return 'bg-blue-100 text-blue-800';
      case 'Security':
        return 'bg-indigo-100 text-indigo-800';
      case 'Usage':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Report Templates</h3>
        <Button
          variant="primary"
          onClick={() => {}}
        >
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      Last modified: {new Date(template.lastModified).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      {template.format}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                  <Edit className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                  <Copy className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}