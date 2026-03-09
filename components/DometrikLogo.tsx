import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect } from 'react-native-svg';
import Colors from '@/constants/colors';

interface DometrikLogoProps {
  size?: number;
  lineColor?: string;
  accentColor?: string;
  dColor?: string;
  strokeWidth?: number;
}

export default function DometrikLogo({
  size = 80,
  lineColor = Colors.primary,
  accentColor = Colors.accent,
  dColor = Colors.text,
  strokeWidth = 3.2,
}: DometrikLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Line
          x1="16" y1="10" x2="16" y2="86"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Line
          x1="16" y1="86" x2="92" y2="86"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <Rect
          x="10" y="80"
          width="12" height="12"
          rx="2" ry="2"
          fill={accentColor}
        />

        <Path
          d="M 40,24 L 40,72 C 40,72 40,24 40,24 Z"
          fill="none"
          stroke={dColor}
          strokeWidth={0}
        />
        <Line
          x1="40" y1="24" x2="40" y2="72"
          stroke={dColor}
          strokeWidth={strokeWidth + 0.4}
          strokeLinecap="round"
        />
        <Path
          d="M 40,24 C 74,24 74,72 40,72"
          fill="none"
          stroke={dColor}
          strokeWidth={strokeWidth + 0.4}
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
