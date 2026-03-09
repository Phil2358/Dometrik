import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface DometrikLogoProps {
  size?: number;
  frameColor?: string;
  markerColor?: string;
  dColor?: string;
}

export default function DometrikLogo({
  size = 80,
  frameColor = '#6A6A6A',
  markerColor = '#6A6A6A',
  dColor = '#1F1F1F',
}: DometrikLogoProps) {
  const sw = 9;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9"
          fill="none"
          stroke={frameColor}
          strokeWidth={sw}
          strokeLinecap="square"
          strokeLinejoin="round"
        />

        <Rect
          x="23"
          y="23"
          width="8"
          height="8"
          rx="1"
          ry="1"
          fill={markerColor}
        />

        <Path
          d="M 46,36 L 46,88"
          fill="none"
          stroke={dColor}
          strokeWidth={sw + 2}
          strokeLinecap="round"
        />
        <Path
          d="M 46,36 C 84,36 84,88 46,88"
          fill="none"
          stroke={dColor}
          strokeWidth={sw + 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
