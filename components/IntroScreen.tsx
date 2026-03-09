import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface IntroScreenProps {
  onStart: () => void;
}

const BULLETS = [
  'Realistic construction cost estimates',
  'Professional cost structure (DIN 276)',
  'Compare multiple building scenarios instantly',
  'Evaluate project feasibility before construction',
];

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const insets = useSafeAreaInsets();
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(14)).current;
  const bodyFade = useRef(new Animated.Value(0)).current;
  const bodySlide = useRef(new Animated.Value(18)).current;
  const bulletAnims = useRef(
    BULLETS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-12),
    }))
  ).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(bodyFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(bodySlide, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.stagger(
        80,
        bulletAnims.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(anim.translateX, { toValue: 0, duration: 250, useNativeDriver: true }),
          ])
        )
      ),
      Animated.parallel([
        Animated.timing(buttonFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(buttonSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, [logoFade, logoScale, titleFade, titleSlide, bodyFade, bodySlide, bulletAnims, buttonFade, buttonSlide]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.topSection}>
        <Animated.View style={[styles.logoWrap, { opacity: logoFade, transform: [{ scale: logoScale }] }]}>
          <View style={styles.iconContainer}>
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

        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }] }}>
          <Text style={styles.appName}>Dometrik</Text>
          <Text style={styles.subtitle}>Construction Cost Calculator</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: bodyFade, transform: [{ translateY: bodySlide }] }]}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Understand the real cost before you build.</Text>
          <View style={styles.taglineLine} />
        </Animated.View>

        <Animated.View style={[styles.descriptionWrap, { opacity: bodyFade, transform: [{ translateY: bodySlide }] }]}>
          <Text style={styles.description}>
            Plan your project with a realistic construction cost estimate based on location, size, quality, and site conditions.
          </Text>
        </Animated.View>

        <View style={styles.bulletsWrap}>
          {BULLETS.map((bullet, index) => (
            <Animated.View
              key={index}
              style={[
                styles.bulletRow,
                {
                  opacity: bulletAnims[index].opacity,
                  transform: [{ translateX: bulletAnims[index].translateX }],
                },
              ]}
            >
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.bottomSection, { opacity: buttonFade, transform: [{ translateY: buttonSlide }] }]}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={onStart}
          testID="intro-start-button"
        >
          <Text style={styles.startButtonText}>Start Calculator</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    zIndex: 9997,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.splash,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.splash,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: {
        shadowColor: Colors.splash,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
    }),
  },
  roofLine: {
    width: 36,
    height: 0,
    borderTopWidth: 2,
    borderTopColor: Colors.terracotta,
    borderLeftWidth: 18,
    borderLeftColor: 'transparent',
    borderRightWidth: 18,
    borderRightColor: 'transparent',
    borderStyle: 'solid' as const,
    marginBottom: -1,
    transform: [{ scaleY: -1 }],
  },
  houseBody: {
    width: 28,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderTopWidth: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  metricLines: {
    gap: 3,
    alignItems: 'center' as const,
  },
  metricLine: {
    width: 14,
    height: 1,
    backgroundColor: Colors.copper,
  },
  metricLineShort: {
    width: 8,
    height: 1,
    backgroundColor: 'rgba(184, 115, 51, 0.5)',
  },
  appName: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  taglineWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 28,
    marginBottom: 20,
    gap: 12,
  },
  taglineLine: {
    height: 1,
    width: 24,
    backgroundColor: Colors.border,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.terracotta,
    fontStyle: 'italic' as const,
    letterSpacing: 0.2,
  },
  descriptionWrap: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  bulletsWrap: {
    alignSelf: 'stretch' as const,
    gap: 10,
    paddingHorizontal: 8,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 2,
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.terracotta,
    marginRight: 10,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  bottomSection: {
    paddingTop: 16,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
    }),
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
