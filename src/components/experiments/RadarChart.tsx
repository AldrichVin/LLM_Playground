import { motion } from 'framer-motion';
import { RadarScores } from '../../types';
import { useMemo } from 'react';

interface RadarChartProps {
  scores: RadarScores;
  compareScores?: RadarScores;
  size?: number;
  color?: string;
  compareColor?: string;
  showLabels?: boolean;
}

const DIMENSIONS: (keyof RadarScores)[] = [
  'accuracy',
  'relevance',
  'conciseness',
  'creativity',
  'format',
  'reasoning',
];

const DIMENSION_LABELS: Record<keyof RadarScores, string> = {
  accuracy: 'Accuracy',
  relevance: 'Relevance',
  conciseness: 'Concise',
  creativity: 'Creative',
  format: 'Format',
  reasoning: 'Reasoning',
};

export function RadarChart({
  scores,
  compareScores,
  size = 200,
  color = '#119a6a',
  compareColor = '#f59e0b',
  showLabels = true,
}: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 40;
  const numAxes = DIMENSIONS.length;

  // Calculate polygon points
  const getPolygonPoints = (data: RadarScores) => {
    return DIMENSIONS.map((dim, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const value = data[dim];
      const r = (value / 5) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate axis end points and label positions
  const axes = useMemo(() => {
    return DIMENSIONS.map((dim, i) => {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      // Label position (slightly beyond the axis)
      const labelDistance = radius + 25;
      const labelX = center + labelDistance * Math.cos(angle);
      const labelY = center + labelDistance * Math.sin(angle);

      return {
        x,
        y,
        labelX,
        labelY,
        label: DIMENSION_LABELS[dim],
      };
    });
  }, [numAxes, radius, center]);

  // Draw grid circles
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = useMemo(() => {
    return gridLevels.map((level) => {
      const points = DIMENSIONS.map((_, i) => {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const r = (level / 5) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
      return points;
    });
  }, [numAxes, radius, center]);

  const mainPoints = getPolygonPoints(scores);
  const comparePoints = compareScores ? getPolygonPoints(compareScores) : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridPolygons.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={axis.x}
            y2={axis.y}
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        ))}

        {/* Comparison polygon (if provided) */}
        {comparePoints && (
          <motion.polygon
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            points={comparePoints}
            fill={compareColor}
            stroke={compareColor}
            strokeWidth="2"
          />
        )}

        {/* Main polygon */}
        <motion.polygon
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 0.5 }}
          points={mainPoints}
          fill={color}
          stroke={color}
          strokeWidth="2"
        />

        {/* Main polygon outline */}
        <motion.polygon
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
          points={mainPoints}
          fill="none"
          stroke={color}
          strokeWidth="3"
        />

        {/* Data points */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
          const value = scores[dim];
          const r = (value / 5) * radius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);

          return (
            <motion.circle
              key={dim}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {showLabels && axes.map((axis, i) => (
          <text
            key={i}
            x={axis.labelX}
            y={axis.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-medium fill-slate-600"
          >
            {axis.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
