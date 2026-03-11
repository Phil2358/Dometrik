import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LOGO_SIZE = 140;
const INTRO_LOGO_SCALE = 0.56;

const FRAME_PATH = 'M 34 86 H 18 V 24 C 18 18 22 14 28 14 H 84';
const STEM_PATH = 'M 54 30 V 82';
const BOWL_PATH = 'M 54 30 C 70 30 78 39 78 56 C 78 73 70 82 54 82';

const FRAME_LENGTH = 150;
const STEM_LENGTH = 52;
const BOWL_LENGTH = 120;

const FRAME_STROKE = 6;
const LETTER_STROKE = 7.5;
const MARKER_SIZE = 14;
const MARKER_RADIUS = 3;
const MARKER_LEFT = LOGO_SIZE * 0.24;
const MARKER_TOP = LOGO_SIZE * 0.24;

const FRAME_COLOR = '#6A6A6A';
const LETTER_COLOR = '#232323';
const SPLASH_STROKE_COLOR = '#FFFFFF';

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
          strokeLinecap="round"
          strokeDasharray={`${STEM_LENGTH} ${STEM_LENGTH}`}
          strokeDashoffset={stemDashOffset ?? 0}
        />
        <AnimatedPath
          d={BOWL_PATH}
          fill="none"
          stroke={letterColor}
          strokeWidth={LETTER_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
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

export default function SplashIntro({ onSplashDone }: SplashIntroProps) {
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

  const showIntroContent = useCallback(() => {
    Animated.sequence([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 240,
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
    ]).start();
  }, [brandOpacity, subtitleOpacity, taglineOpacity]);

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
        duration: 300,
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
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(markerOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(markerScale, {
          toValue: 1,
          tension: 100,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(stemDashOffset, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(bowlDashOffset, {
            toValue: 0,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
      ]),
      Animated.delay(260),
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
            <Animated.Text style={[styles.brandName, { opacity: brandOpacity }]}>
              Dometrik
            </Animated.Text>

            <Animated.Text style={[styles.subtitleText, { opacity: subtitleOpacity }]}>
              Construction Cost Estimator
            </Animated.Text>

            <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
              <View style={styles.taglineLine} />
              <Text style={styles.taglineText}>Understand the real cost before you build.</Text>
              <View style={styles.taglineLine} />
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
          <DometrikLogo
            frameColor={FRAME_COLOR}
            markerColor={Colors.accent}
            letterColor={LETTER_COLOR}
          />
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
  },
  taglineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    textAlign: 'center',
  },
});
