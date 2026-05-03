import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../../theme';

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const buildMatrix = (text, dim = 25) => {
  const out = Array(dim).fill(0).map(() => Array(dim).fill(false));
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const seed = cyrb53(`${text}|${x},${y}`);
      out[y][x] = seed % 2 === 0;
    }
  }
  const drawFinder = (sx, sy) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const onBorder = y === 0 || y === 6 || x === 0 || x === 6;
      const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      out[sy + y][sx + x] = onBorder || inner;
    }
  };
  drawFinder(0, 0);
  drawFinder(dim - 7, 0);
  drawFinder(0, dim - 7);
  for (let i = 8; i < dim - 8; i++) {
    out[6][i] = i % 2 === 0;
    out[i][6] = i % 2 === 0;
  }
  return out;
};

export default function QRCode({ value, size = 200, fg, bg }) {
  const theme = useTheme();
  const foreground = fg || theme.text;
  const background = bg || theme.surface;
  const dim = 25;
  const matrix = useMemo(() => buildMatrix(value || '', dim), [value]);
  const cell = size / dim;

  return (
    <View style={{
      backgroundColor: background, padding: 12, borderRadius: 12,
      borderWidth: 1, borderColor: theme.surfaceLine
    }}>
      <Svg width={size} height={size}>
        <Rect x={0} y={0} width={size} height={size} fill={background} />
        {matrix.map((row, y) => row.map((on, x) => on && (
          <Rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={foreground} />
        )))}
      </Svg>
    </View>
  );
}
