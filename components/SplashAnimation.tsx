import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Home, Euro, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashAnimationProps {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const zapOpacity = useRef(new Animated.Value(0)).current;
  const zapScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(zapOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(zapScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [bgOpacity, iconScale, iconOpacity, zapOpacity, zapScale, textOpacity, textTranslateY, fadeOut, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: Animated.multiply(bgOpacity, fadeOut) }]}>
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Home size={38} color="#FFFFFF" strokeWidth={1.8} />
            <View style={styles.euroOverlay}>
              <Euro size={18} color="#2DD4BF" strokeWidth={2.5} />
            </View>
          </View>

          <Animated.View
            style={[
              styles.zapContainer,
              {
                opacity: zapOpacity,
                transform: [{ scale: zapScale }],
              },
            ]}
          >
            <Zap size={16} color="#2DD4BF" fill="#2DD4BF" />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          }}
        >
          <Text style={styles.brandName}>SnapCost</Text>
          <Text style={styles.tagline}>Construction Cost Estimator</Text>
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
    backgroundColor: '#1E1E24',
    zIndex: 9999,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerContent: {
    alignItems: 'center' as const,
    gap: 28,
  },
  iconContainer: {
    position: 'relative' as const,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(45, 212, 191, 0.25)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  euroOverlay: {
    position: 'absolute' as const,
    bottom: 14,
    right: 14,
  },
  zapContainer: {
    position: 'absolute' as const,
    top: -6,
    right: -8,
    backgroundColor: '#1E1E24',
    borderRadius: 12,
    padding: 3,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    textAlign: 'center' as const,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    textAlign: 'center' as const,
    marginTop: 6,
  },
});
