import React from 'react';
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';
import { useTheme } from '../../theme';

export default function Sparkline({ data = [], width = 220, height = 60 }) {
  const theme = useTheme();
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const polyline = points.map((p) => p.join(',')).join(' ');
  const fillPoints = `0,${height} ${polyline} ${width},${height}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sl" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={theme.accent} stopOpacity="0.4" />
          <Stop offset="1" stopColor={theme.accent} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={fillPoints} fill="url(#sl)" />
      <Polyline points={polyline} stroke={theme.accent} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {points.length ? (
        <Circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={3} fill={theme.accent} />
      ) : null}
    </Svg>
  );
}
