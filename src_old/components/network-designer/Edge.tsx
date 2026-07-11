import { NetworkNode, NetworkEdge } from '../../types';

interface EdgeProps {
  edge: NetworkEdge;
  nodes: NetworkNode[];
  isSelected: boolean;
  onClick: () => void;
  showEffects?: boolean;
}

export function Edge({ edge, nodes, isSelected, onClick, showEffects = false }: EdgeProps) {
  // Find source and target nodes
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);
  
  // Only render the edge if both source and target nodes exist
  if (!sourceNode || !targetNode) {
    console.warn(`Edge ${edge.id} has missing nodes:`, { 
      sourceExists: !!sourceNode, 
      targetExists: !!targetNode,
      sourceId: edge.source,
      targetId: edge.target 
    });
    return null;
  }

  // Get source and target center points
  const sourceX = sourceNode.x + 32; // Add half the node width
  const sourceY = sourceNode.y + 32; // Add half the node height
  const targetX = targetNode.x + 32;
  const targetY = targetNode.y + 32;

  // Calculate the midpoint for the control point
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Adjust curvature based on distance
  const curvature = Math.min(distance * 0.2, 50);

  // Calculate control points for the curve
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const cx = midX - curvature * Math.sin(angle);
  const cy = midY + curvature * Math.cos(angle);

  // Calculate arrow points
  const arrowLength = 10;
  const arrowWidth = 6;
  const arrowAngle = Math.PI / 6; // 30 degrees

  // Get point along the curve for arrow placement
  const t = 0.8; // Position arrow at 80% along the curve
  const arrowX = targetX - (targetX - cx) * t;
  const arrowY = targetY - (targetY - cy) * t;

  // Calculate arrow points
  const dx2 = targetX - arrowX;
  const dy2 = targetY - arrowY;
  const angle2 = Math.atan2(dy2, dx2);

  const arrowPoints = [
    [arrowX, arrowY],
    [
      arrowX - arrowLength * Math.cos(angle2 - arrowAngle),
      arrowY - arrowLength * Math.sin(angle2 - arrowAngle)
    ],
    [
      arrowX - arrowLength * Math.cos(angle2 + arrowAngle),
      arrowY - arrowLength * Math.sin(angle2 + arrowAngle)
    ]
  ];

  // Get edge type-specific styling
  const getEdgeTypeStyles = () => {
    switch (edge.type) {
      case 'Ultra-Low Latency':
        return {
          strokeWidth: 4,
          strokeDasharray: '0',
          color: 'purple',
          glowColor: 'rgba(147, 51, 234, 0.5)'
        };
      case 'Quantum Secure':
        return {
          strokeWidth: 3,
          strokeDasharray: '5,3',
          color: 'emerald',
          glowColor: 'rgba(16, 185, 129, 0.5)'
        };
      case 'Backbone':
        return {
          strokeWidth: 5,
          strokeDasharray: '0',
          color: 'indigo',
          glowColor: 'rgba(79, 70, 229, 0.5)'
        };
      case 'Direct Connect':
        return {
          strokeWidth: 3,
          strokeDasharray: '0',
          color: 'brand-blue',
          glowColor: 'rgba(0, 159, 219, 0.5)'
        };
      case 'AVPN':
        return {
          strokeWidth: 2,
          strokeDasharray: '5,5',
          color: 'brand-blue',
          glowColor: 'rgba(0, 159, 219, 0.3)'
        };
      default:
        return {
          strokeWidth: 2,
          strokeDasharray: '0',
          color: 'brand-blue',
          glowColor: 'rgba(0, 159, 219, 0.3)'
        };
    }
  };

  const edgeStyles = getEdgeTypeStyles();

  const pathData = `
    M ${sourceX} ${sourceY}
    Q ${cx} ${cy} ${targetX} ${targetY}
  `;

  return (
    <g 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ pointerEvents: 'all' }}
      className="cursor-pointer group"
    >
      {/* Interaction Hit Area */}
      <path
        d={pathData}
        className="stroke-[20] stroke-transparent"
        fill="none"
      />

      {/* Main Connection Line */}
      <path
        d={pathData}
        className={`
          fill-none transition-all duration-200
          ${isSelected
            ? 'stroke-brand-blue'
            : edge.status === 'active'
            ? `stroke-${edgeStyles.color}-500`
            : 'stroke-gray-300'
          }
          group-hover:stroke-2
        `}
        style={{
          strokeWidth: edgeStyles.strokeWidth,
          strokeDasharray: edgeStyles.strokeDasharray
        }}
      />

      {/* Direction Arrow */}
      <polygon
        points={arrowPoints.map(p => p.join(',')).join(' ')}
        className={`
          transition-all duration-200
          ${isSelected
            ? 'fill-brand-blue'
            : edge.status === 'active'
            ? `fill-${edgeStyles.color}-500`
            : 'fill-gray-300'
          }
        `}
      />

      {/* Status Indicator */}
      <circle
        cx={midX}
        cy={midY}
        r="4"
        className={`
          transition-all duration-200
          ${edge.status === 'active'
            ? `fill-${edgeStyles.color}-500`
            : 'fill-gray-400'
          }
        `}
      />

      {/* Elegant Inline Label - Always Visible */}
      <g transform={`translate(${midX},${midY - 25})`}>
        {/* Background with subtle shadow */}
        <defs>
          <filter id={`shadow-${edge.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1"/>
          </filter>
        </defs>
        <rect
          x="-80"
          y="-18"
          width="160"
          height="36"
          rx="18"
          className="fill-white stroke-gray-200"
          strokeWidth="1"
          filter={`url(#shadow-${edge.id})`}
        />
        {/* Connection type and bandwidth */}
        <text
          x="0"
          y="-4"
          className="text-[10px] fill-gray-600 font-medium"
          textAnchor="middle"
        >
          {edge.type}
        </text>
        <text
          x="-35"
          y="10"
          className="text-[9px] fill-brand-blue font-semibold"
          textAnchor="middle"
        >
          {edge.bandwidth}
        </text>
        {/* Separator */}
        <line
          x1="-15"
          y1="6"
          x2="-15"
          y2="14"
          className="stroke-gray-200"
          strokeWidth="1"
        />
        {/* Latency */}
        <text
          x="15"
          y="10"
          className="text-[9px] fill-green-600 font-semibold"
          textAnchor="middle"
        >
          {edge.metrics?.latency || '<10ms'}
        </text>
        {/* Status indicator dot */}
        <circle
          cx="60"
          cy="7"
          r="3"
          className={`
            ${edge.status === 'active'
              ? 'fill-green-500'
              : 'fill-gray-400'
            }
          `}
        />
      </g>
    </g>
  );
}