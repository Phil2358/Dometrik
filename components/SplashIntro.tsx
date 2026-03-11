import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '@/constants/colors';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const SPLASH_LOGO_WIDTH = 220;
const INTRO_LOGO_WIDTH = 150;
const INTRO_LOGO_SCALE = INTRO_LOGO_WIDTH / SPLASH_LOGO_WIDTH;

const BULLETS = [
  'Realistic construction cost estimates',
  'Professional cost structure (DIN 276)',
  'Compare building scenarios instantly',
  'Evaluate project feasibility before construction',
];

const LOGO_SOURCE = require('../assets/images/dometrik-logo-exact.png');

interface SplashIntroProps {
  onSplashDone: () => void;
  onStart: () => void;
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'splash' | 'transition' | 'intro'>('splash');

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
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 160,
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
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 220,
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
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(introFadeIn, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(splashLogoOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(introLogoOpacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(logoLift, {
        toValue: -120,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: INTRO_LOGO_SCALE,
        duration: 520,
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
      Animated.delay(180),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1,
        useNativeDriver: true,
      }),
      Animated.delay(900),
    ]).start(startTransition);
  }, [logoScale, startTransition]);

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
                <LinearGradient
                  colors={[Colors.accentGradientStart, Colors.accentGradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Start Estimate</Text>
                </LinearGradient>
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
          <AnimatedImage source={LOGO_SOURCE} style={styles.splashLogo} resizeMode="contain" />
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
          <Image source={LOGO_SOURCE} style={styles.splashLogo} resizeMode="contain" />
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
    backgroundColor: Colors.background,
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
    paddingTop: 208,
  },
  logoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  logoLayer: {
    position: 'absolute',
    width: SPLASH_LOGO_WIDTH,
    alignItems: 'center',
  },
  splashLogo: {
    width: SPLASH_LOGO_WIDTH,
    height: 220,
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
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.accentStrong,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: {
        shadowColor: Colors.accentStrong,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
    }),
  },
  startButtonGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});



