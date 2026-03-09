import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Polyline, Line } from 'react-native-svg';
import Colors from '@/constants/colors';

interface DometrikLogoProps {
  size?: number;
  color?: string;
  accentColor?: string;
  strokeWidth?: number;
}

export default function DometrikLogo({
  size = 80,
  color = '#FFFFFF',
  accentColor = Colors.accent,
  strokeWidth = 2.8,
}: DometrikLogoProps) {
  const viewBox = '0 0 100 100';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        <Polyline
          points="10,48 50,14 90,48"
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth + 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Line
          x1="22"
          y1="42"
          x2="22"
          y2="86"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1="78"
          y1="42"
          x2="78"
          y2="86"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1="22"
          y1="86"
          x2="78"
          y2="86"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Path
          d="M 40,56 L 40,72 Q 40,76 44,76 L 56,76 Q 60,76 60,72 L 60,56 Q 60,48 50,48 Q 40,48 40,56 Z"
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Line
          x1="40"
          y1="52"
          x2="40"
          y2="76"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
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
