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

  const sw = 6;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">

        {/* Frame */}
        <Path
          d="M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9"
          fill="none"
          stroke={frameColor}
          strokeWidth={sw}
          strokeLinecap="square"
          strokeLinejoin="round"
        />

        {/* Marker */}
        <Rect
          x="23"
          y="23"
          width="8"
          height="8"
          rx="1"
          ry="1"
          fill={markerColor}
        />

        {/* D */}
        <Path
          d="M 48,36 L 48,88"
          fill="none"
          stroke={dColor}
          strokeWidth={sw + 2}
          strokeLinecap="round"
        />

        <Path
          d="M 48,36 C 74,36 74,88 48,88"
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