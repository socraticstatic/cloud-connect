import { Award, CheckCircle, Users, Leaf, Target } from 'lucide-react';
import { Connection } from '../../../../../types';

interface BCorpStatusWidgetProps {
  connections: Connection[];
}

export function BCorpStatusWidget({ connections }: BCorpStatusWidgetProps) {
  // B Corp Impact Areas
  const impactAreas = [
    { name: 'Governance', score: 18.2, max: 20, icon: Target },
    { name: 'Workers', score: 24.5, max: 30, icon: Users },
    { name: 'Community', score: 16.8, max: 20, icon: CheckCircle },
    { name: 'Environment', score: 28.4, max: 35, icon: Leaf }
  ];

  const totalScore = impactAreas.reduce((sum, area) => sum + area.score, 0);
  const certificationThreshold = 80;
  const percentageComplete = (totalScore / certificationThreshold * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* B Corp Score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {totalScore.toFixed(1)} pts
          </div>
          <div className="flex items-center mt-1">
            <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm text-blue-600">{percentageComplete}%</span>
            <span className="text-sm text-gray-500 ml-1">of certification</span>
          </div>
        </div>
        <Award className="h-8 w-8 text-blue-500" />
      </div>

      {/* Certification Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Certification Progress</span>
          <span>Required: {certificationThreshold} pts</span>
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${percentageComplete}%` }}
          />
        </div>
      </div>

      {/* Impact Areas */}
      <div className="space-y-2">
        {impactAreas.map((area) => {
          const AreaIcon = area.icon;
          const percentage = (area.score / area.max * 100).toFixed(0);

          return (
            <div key={area.name} className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <AreaIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{area.name}</span>
              </div>
              <div className="flex items-center ml-3">
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8 text-right">
                  {area.score.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Target className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-medium text-blue-700">Next Milestone</div>
            <div className="text-xs text-blue-600 mt-0.5">
              +2.1 pts needed for certification
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          View Report
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Improve Score
        </button>
      </div>
    </div>
  );
}
