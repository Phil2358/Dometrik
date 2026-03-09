import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashAnimationProps {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const bgColorProgress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1.08)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bgColorProgress, {
          toValue: 1,
          duration: 350,
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.delay(150),
    ]).start(() => {
      onFinish();
    });
  }, [bgColorProgress, logoOpacity, logoScale, textOpacity, subtitleOpacity, onFinish]);

  const bgColor = bgColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.splash, Colors.background],
  });

  const logoColor = bgColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', Colors.splash],
  });

  const roofColor = bgColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.terracotta, Colors.terracotta],
  });

  const textColor = bgColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', Colors.text],
  });

  const subtitleColor = bgColorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.35)', Colors.textSecondary],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.centerContent}>
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
            <Animated.View
              style={[
                styles.roofLine,
                { borderTopColor: roofColor },
              ]}
            />
            <Animated.View
              style={[
                styles.houseBody,
                { borderColor: logoColor },
              ]}
            >
              <Animated.Text style={[styles.euroSymbol, { color: roofColor }]}>
                €
              </Animated.Text>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: textOpacity,
              color: textColor,
            },
          ]}
        >
          Dometrik
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: subtitleOpacity,
              color: subtitleColor,
            },
          ]}
        >
          Construction Cost Calculator
        </Animated.Text>
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
    zIndex: 9999,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerContent: {
    alignItems: 'center' as const,
    gap: 18,
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
    width: 56,
    height: 0,
    borderTopWidth: 3,
    borderTopColor: Colors.terracotta,
    borderLeftWidth: 28,
    borderLeftColor: 'transparent',
    borderRightWidth: 28,
    borderRightColor: 'transparent',
    borderStyle: 'solid' as const,
    marginBottom: -1,
    transform: [{ scaleY: -1 }],
  },
  houseBody: {
    width: 44,
    height: 34,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    borderTopWidth: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  euroSymbol: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.terracotta,
    marginTop: -2,
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
