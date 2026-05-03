import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTheme, fontSize } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TIERS = [
  { name: 'Bronze', floor: 0, ceiling: 500, color: '#A07042' },
  { name: 'Silver', floor: 500, ceiling: 2000, color: '#B8B8B8' },
  { name: 'Gold', floor: 2000, ceiling: 5000, color: '#C8A45C' },
  { name: 'Platinum', floor: 5000, ceiling: 5000, color: '#E5E4E2' }
];

export default function LoyaltyRing({ tier = 'Bronze', spend = 0, size = 140, strokeWidth = 10 }) {
  const theme = useTheme();
  const tierIdx = TIERS.findIndex((t) => t.name === tier);
  const current = TIERS[tierIdx] || TIERS[0];
  const next = TIERS[Math.min(tierIdx + 1, TIERS.length - 1)];

  const isMax = tierIdx === TIERS.length - 1;
  const span = next.floor - current.floor || 1;
  const ratio = isMax ? 1 : Math.min(1, Math.max(0, (spend - current.floor) / span));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [ratio]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - progress.value * circumference
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={theme.surfaceLine} strokeWidth={strokeWidth} fill="none"
        />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={current.color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeLinecap="round"
          rotation="-90" origin={`${size / 2}, ${size / 2}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{
          color: theme.textMuted, fontSize: fontSize.xs,
          letterSpacing: 1.6, textTransform: 'uppercase', fontWeight: '700'
        }}>{isMax ? 'Top Tier' : 'Next: ' + next.name}</Text>
        <Text style={{ color: current.color, fontSize: fontSize.xxl, fontWeight: '900' }}>{tier}</Text>
        <Text style={{ color: theme.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
          {isMax ? `$${Math.round(spend)} lifetime` : `$${Math.round(spend - current.floor)} / $${span}`}
        </Text>
      </View>
    </View>
  );
}
