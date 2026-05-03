import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedReaction, runOnJS, withTiming, Easing } from 'react-native-reanimated';

export default function CountUp({ to = 0, prefix = '', suffix = '', duration = 1100, style, format }) {
  const value = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    value.value = 0;
    value.value = withTiming(to, { duration, easing: Easing.out(Easing.cubic) });
  }, [to]);

  useAnimatedReaction(
    () => value.value,
    (v) => { runOnJS(setDisplay)(v); },
    [to]
  );

  const formatted = format ? format(display) : Math.round(display).toLocaleString();
  return <Text style={style}>{prefix}{formatted}{suffix}</Text>;
}
