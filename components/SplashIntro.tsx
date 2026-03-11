import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOGO_SIZE = 140;
const INTRO_LOGO_SCALE = 0.56;

const FRAME_PATH = 'M 34 86 H 18 V 24 C 18 18 22 14 28 14 H 86';
const STEM_PATH = 'M 52 14 V 86';
const BOWL_PATH = 'M 52 14 H 68 C 80 14 86 20 86 32 V 68 C 86 80 80 86 68 86 H 52';

const FRAME_LENGTH = 160;
const STEM_LENGTH = 72;
const BOWL_LENGTH = 156;

const FRAME_STROKE = 6;
const LETTER_STROKE = 6.2;
const MARKER_SIZE = 14;
const MARKER_RADIUS = 2;
const MARKER_LEFT = LOGO_SIZE * 0.24;
const MARKER_TOP = LOGO_SIZE * 0.24;

const FRAME_COLOR = '#6A6A6A';
const LETTER_COLOR = '#232323';
const SPLASH_STROKE_COLOR = '#FFFFFF';

const BULLETS = [
  'Realistic construction cost estimates',
  'Professional cost structure (DIN 276)',
  'Compare building scenarios instantly',
  'Evaluate project feasibility before construction',
];

interface DometrikLogoProps {
  frameColor: string;
  markerColor: string;
  letterColor: string;
  frameDashOffset?: Animated.Value;
  stemDashOffset?: Animated.Value;
  bowlDashOffset?: Animated.Value;
  markerOpacity?: Animated.Value;
  markerScale?: Animated.Value;
}

function DometrikLogo({
  frameColor,
  markerColor,
  letterColor,
  frameDashOffset,
  stemDashOffset,
  bowlDashOffset,
  markerOpacity,
  markerScale,
}: DometrikLogoProps) {
  return (
    <View style={styles.logoCanvas}>
      <Svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 100 100">
        <AnimatedPath
          d={FRAME_PATH}
          fill="none"
          stroke={frameColor}
          strokeWidth={FRAME_STROKE}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray={`${FRAME_LENGTH} ${FRAME_LENGTH}`}
          strokeDashoffset={frameDashOffset ?? 0}
        />
        <AnimatedPath
          d={STEM_PATH}
          fill="none"
          stroke={letterColor}
          strokeWidth={LETTER_STROKE}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray={`${STEM_LENGTH} ${STEM_LENGTH}`}
          strokeDashoffset={stemDashOffset ?? 0}
        />
        <AnimatedPath
          d={BOWL_PATH}
          fill="none"
          stroke={letterColor}
          strokeWidth={LETTER_STROKE}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray={`${BOWL_LENGTH} ${BOWL_LENGTH}`}
          strokeDashoffset={bowlDashOffset ?? 0}
        />
      </Svg>

      <Animated.View
        style={[
          styles.marker,
          {
            backgroundColor: markerColor,
            opacity: markerOpacity ?? 1,
            transform: [{ scale: markerScale ?? 1 }],
          },
        ]}
      />
    </View>
  );
}

interface SplashIntroProps {
  onSplashDone: () => void;
  onStart: () => void;
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'splash' | 'transition' | 'intro'>('splash');

  const frameDashOffset = useRef(new Animated.Value(FRAME_LENGTH)).current;
  const stemDashOffset = useRef(new Animated.Value(STEM_LENGTH)).current;
  const bowlDashOffset = useRef(new Animated.Value(BOWL_LENGTH)).current;
  const markerOpacity = useRef(new Animated.Value(0)).current;
  const markerScale = useRef(new Animated.Value(0.7)).current;

  const splashFadeOut = useRef(new Animated.Value(1)).current;
  const introFadeIn = useRef(new Animated.Value(0)).current;
  const splashLogoOpacity = useRef(new Animated.Value(1)).current;
  const introLogoOpacity = useRef(new Animated.Value(0)).current;
  const logoLift = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const bulletAnims = useRef(BULLETS.map(() => new Animated.Value(0))).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  const showIntroContent = useCallback(() => {
    Animated.sequence([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.stagger(
        60,
        bulletAnims.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          })
        )
      ),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [brandOpacity, subtitleOpacity, taglineOpacity, bulletAnims, buttonOpacity, buttonSlide]);

  const startTransition = useCallback(() => {
    onSplashDone();
    setPhase('transition');

    Animated.parallel([
      Animated.timing(splashFadeOut, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(introFadeIn, {
        toValue: 1,
        duration: 540,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashLogoOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(introLogoOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoLift, {
        toValue: -54,
        duration: 560,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: INTRO_LOGO_SCALE,
        duration: 560,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase('intro');
      showIntroContent();
    });
  }, [
    introFadeIn,
    introLogoOpacity,
    logoLift,
    logoScale,
    onSplashDone,
    showIntroContent,
    splashFadeOut,
    splashLogoOpacity,
  ]);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(frameDashOffset, {
        toValue: 0,
        duration: 920,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(markerOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(markerScale, {
          toValue: 1,
          tension: 110,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(stemDashOffset, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(70),
          Animated.timing(bowlDashOffset, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
      ]),
      Animated.delay(240),
    ]).start(startTransition);
  }, [
    bowlDashOffset,
    frameDashOffset,
    markerOpacity,
    markerScale,
    startTransition,
    stemDashOffset,
  ]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.splashScreen, { opacity: splashFadeOut }]}
        pointerEvents={phase === 'splash' ? 'auto' : 'none'}
      />

      <Animated.View
        style={[
          styles.introScreen,
          {
            opacity: introFadeIn,
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        pointerEvents={phase !== 'splash' ? 'auto' : 'none'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.introContent}>
            <Animated.Text style={[styles.brandName, { opacity: brandOpacity }]}>Dometrik</Animated.Text>

            <Animated.Text style={[styles.subtitleText, { opacity: subtitleOpacity }]}>
              Construction Cost Estimator
            </Animated.Text>

            <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
              <View style={styles.taglineLine} />
              <Text style={styles.taglineText}>Understand the real cost before you build.</Text>
              <View style={styles.taglineLine} />
            </Animated.View>

            <View style={styles.bulletsWrap}>
              {BULLETS.map((bullet, index) => (
                <Animated.View key={bullet} style={[styles.bulletRow, { opacity: bulletAnims[index] }]}>
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
                activeOpacity={0.85}
                onPress={onStart}
                testID="intro-start-button"
              >
                <Text style={styles.startButtonText}>Start Estimate</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </Animated.View>

      <View pointerEvents="none" style={styles.logoStage}>
        <Animated.View
          style={[
            styles.logoLayer,
            {
              opacity: splashLogoOpacity,
              transform: [{ translateY: logoLift }, { scale: logoScale }],
            },
          ]}
        >
          <DometrikLogo
            frameColor={SPLASH_STROKE_COLOR}
            markerColor={Colors.accent}
            letterColor={SPLASH_STROKE_COLOR}
            frameDashOffset={frameDashOffset}
            stemDashOffset={stemDashOffset}
            bowlDashOffset={bowlDashOffset}
            markerOpacity={markerOpacity}
            markerScale={markerScale}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.logoLayer,
            {
              opacity: introLogoOpacity,
              transform: [{ translateY: logoLift }, { scale: logoScale }],
            },
          ]}
        >
          <DometrikLogo frameColor={FRAME_COLOR} markerColor={Colors.accent} letterColor={LETTER_COLOR} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  splashScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.splash,
    zIndex: 1,
  },
  introScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 0,
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  introContent: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    paddingTop: 124,
  },
  logoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoLayer: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  logoCanvas: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  marker: {
    position: 'absolute',
    top: MARKER_TOP,
    left: MARKER_LEFT,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_RADIUS,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  taglineLine: {
    width: 18,
    height: 1,
    backgroundColor: Colors.border,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
    fontStyle: 'italic',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  bulletsWrap: {
    alignSelf: 'stretch',
    gap: 12,
    paddingHorizontal: 8,
    marginTop: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  buttonWrap: {
    alignSelf: 'stretch',
    paddingHorizontal: 8,
    marginTop: 22,
  },
  startButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
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
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
