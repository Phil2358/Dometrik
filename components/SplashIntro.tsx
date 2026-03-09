import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Line, Rect, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const LOGO_SIZE_SPLASH = 130;
const LOGO_SIZE_INTRO = 64;

const BULLETS = [
  'Realistic construction cost estimates',
  'Professional cost structure (DIN 276)',
  'Compare building scenarios instantly',
  'Evaluate project feasibility before construction',
];

interface SplashIntroProps {
  onSplashDone: () => void;
  onStart: () => void;
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {
  const insets = useSafeAreaInsets();

  const vertLineOpacity = useRef(new Animated.Value(0)).current;
  const horizLineOpacity = useRef(new Animated.Value(0)).current;
  const squareOpacity = useRef(new Animated.Value(0)).current;
  const dLetterOpacity = useRef(new Animated.Value(0)).current;

  const bgProgress = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const bulletAnims = useRef(BULLETS.map(() => new Animated.Value(0))).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  const scaleRatio = LOGO_SIZE_INTRO / LOGO_SIZE_SPLASH;

  const startIntroTransition = useCallback(() => {
    console.log('[SplashIntro] Starting intro transition');
    Animated.parallel([
      Animated.timing(bgProgress, {
        toValue: 1,
        duration: 550,
        useNativeDriver: false,
      }),
      Animated.timing(logoScale, {
        toValue: scaleRatio,
        duration: 550,
        useNativeDriver: false,
      }),
      Animated.timing(logoTranslateY, {
        toValue: -180,
        duration: 550,
        useNativeDriver: false,
      }),
    ]).start(() => {
      console.log('[SplashIntro] Logo transition complete, showing content');
      Animated.sequence([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.stagger(
          60,
          bulletAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: false,
            })
          )
        ),
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(buttonSlide, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    });
  }, [bgProgress, logoScale, logoTranslateY, brandOpacity, subtitleOpacity, taglineOpacity, bulletAnims, buttonOpacity, buttonSlide, scaleRatio]);

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(vertLineOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(450),
        Animated.timing(horizLineOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(550),
        Animated.timing(squareOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(1100),
        Animated.timing(dLetterOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      console.log('[SplashIntro] Draw animation complete (2.5s)');
      setTimeout(() => {
        onSplashDone();
        startIntroTransition();
      }, 200);
    });
  }, [vertLineOpacity, horizLineOpacity, squareOpacity, dLetterOpacity, onSplashDone, startIntroTransition]);

  const bgColor = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.splash, Colors.background],
  });

  const SW = 3.2;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.logoArea}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [
                { scale: logoScale },
                { translateY: logoTranslateY },
              ],
            },
          ]}
        >
          <View style={{ width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH }}>
            <Animated.View style={[styles.svgLayer, { opacity: vertLineOpacity }]}>
              <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
                <Line
                  x1="16" y1="10" x2="16" y2="86"
                  stroke="#FFFFFF"
                  strokeWidth={SW}
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>

            <Animated.View style={[styles.svgLayer, { opacity: horizLineOpacity }]}>
              <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
                <Line
                  x1="16" y1="86" x2="92" y2="86"
                  stroke="#FFFFFF"
                  strokeWidth={SW}
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>

            <Animated.View style={[styles.svgLayer, { opacity: squareOpacity }]}>
              <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
                <Rect
                  x="10" y="80"
                  width="12" height="12"
                  rx="2" ry="2"
                  fill={Colors.accent}
                />
              </Svg>
            </Animated.View>

            <Animated.View style={[styles.svgLayer, { opacity: dLetterOpacity }]}>
              <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
                <Line
                  x1="40" y1="24" x2="40" y2="72"
                  stroke="#FFFFFF"
                  strokeWidth={SW + 0.4}
                  strokeLinecap="round"
                />
                <Path
                  d="M 40,24 C 74,24 74,72 40,72"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={SW + 0.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.introContent,
          {
            opacity: brandOpacity.interpolate({
              inputRange: [0, 0.01, 1],
              outputRange: [0, 1, 1],
            }),
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        pointerEvents="box-none"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.logoSpacer} />

          <Animated.Text style={[styles.brandName, { opacity: brandOpacity }]}>
            Dometrik
          </Animated.Text>

          <Animated.Text style={[styles.subtitleText, { opacity: subtitleOpacity }]}>
            Construction Cost Estimator
          </Animated.Text>

          <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>
              Understand the real cost before you build.
            </Text>
            <View style={styles.taglineLine} />
          </Animated.View>

          <View style={styles.bulletsWrap}>
            {BULLETS.map((bullet, index) => (
              <Animated.View
                key={index}
                style={[styles.bulletRow, { opacity: bulletAnims[index] }]}
              >
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </Animated.View>
            ))}
          </View>

          <Animated.View
            style={[
              styles.buttonWrap,
              {
                opacity: buttonOpacity,
                transform: [{ translateY: buttonSlide }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={onStart}
              testID="intro-start-button"
            >
              <Text style={styles.startButtonText}>Start Estimate</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  logoArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 2,
  },
  logoWrap: {
    width: LOGO_SIZE_SPLASH,
    height: LOGO_SIZE_SPLASH,
  },
  svgLayer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  introContent: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingBottom: 20,
  },
  logoSpacer: {
    height: LOGO_SIZE_INTRO + 20,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  taglineWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
    gap: 10,
    paddingHorizontal: 8,
  },
  taglineLine: {
    height: 1,
    width: 18,
    backgroundColor: Colors.border,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
    fontStyle: 'italic' as const,
    letterSpacing: 0.2,
    textAlign: 'center' as const,
    flexShrink: 1,
  },
  bulletsWrap: {
    alignSelf: 'stretch' as const,
    gap: 12,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  buttonWrap: {
    alignSelf: 'stretch' as const,
    paddingHorizontal: 8,
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: {
        shadowColor: Colors.accent,
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
