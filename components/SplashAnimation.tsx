import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashAnimationProps {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const lineProgress1 = useRef(new Animated.Value(0)).current;
  const lineProgress2 = useRef(new Animated.Value(0)).current;
  const lineProgress3 = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.stagger(80, [
        Animated.timing(lineProgress1, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lineProgress2, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lineProgress3, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 10,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(300),
    ]).start(() => {
      onFinish();
    });
  }, [bgOpacity, lineProgress1, lineProgress2, lineProgress3, logoOpacity, logoScale, textOpacity, textTranslateY, subtitleOpacity, onFinish]);

  const line1TranslateX = lineProgress1.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });
  const line2TranslateY = lineProgress2.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  const line3TranslateX = lineProgress3.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <View style={styles.centerContent}>
        <View style={styles.logoArea}>
          <Animated.View style={[styles.gridLine1, { opacity: lineProgress1, transform: [{ translateX: line1TranslateX }] }]} />
          <Animated.View style={[styles.gridLine2, { opacity: lineProgress2, transform: [{ translateY: line2TranslateY }] }]} />
          <Animated.View style={[styles.gridLine3, { opacity: lineProgress3, transform: [{ translateX: line3TranslateX }] }]} />

          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.iconShape}>
              <View style={styles.roofLine} />
              <View style={styles.houseBody}>
                <View style={styles.metricLines}>
                  <View style={styles.metricLine} />
                  <View style={styles.metricLineShort} />
                  <View style={styles.metricLine} />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          }}
        >
          <Text style={styles.brandName}>Dometrik</Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.tagline}>Construction Cost Calculator</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: Colors.splash,
    zIndex: 9999,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerContent: {
    alignItems: 'center' as const,
    gap: 20,
  },
  logoArea: {
    width: 100,
    height: 100,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  gridLine1: {
    position: 'absolute' as const,
    top: 10,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(184, 134, 11, 0.2)',
  },
  gridLine2: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 50,
    width: 1,
    backgroundColor: 'rgba(184, 134, 11, 0.2)',
  },
  gridLine3: {
    position: 'absolute' as const,
    bottom: 10,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(184, 134, 11, 0.2)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  iconShape: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  roofLine: {
    width: 52,
    height: 0,
    borderTopWidth: 2.5,
    borderTopColor: Colors.terracotta,
    borderLeftWidth: 26,
    borderLeftColor: 'transparent',
    borderRightWidth: 26,
    borderRightColor: 'transparent',
    borderStyle: 'solid' as const,
    marginBottom: -1,
    transform: [{ scaleY: -1 }],
  },
  houseBody: {
    width: 40,
    height: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopWidth: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  metricLines: {
    gap: 5,
    alignItems: 'center' as const,
  },
  metricLine: {
    width: 20,
    height: 1.5,
    backgroundColor: Colors.copper,
  },
  metricLineShort: {
    width: 12,
    height: 1.5,
    backgroundColor: 'rgba(184, 115, 51, 0.5)',
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center' as const,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.8,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },
});
