import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Svg, { Path, Polyline, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LOGO_SIZE_SPLASH = 120;
const LOGO_SIZE_INTRO = 72;

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

function LogoLayer({
  size,
  opacity,
  children,
}: {
  size: number;
  opacity: Animated.Value | Animated.AnimatedInterpolation<number>;
  children: React.ReactNode;
}) {
  return (
    <Animated.View style={[styles.logoLayer, { width: size, height: size, opacity }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {children}
      </Svg>
    </Animated.View>
  );
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {
  const insets = useSafeAreaInsets();

  const roofOpacity = useRef(new Animated.Value(0)).current;
  const wallOpacity = useRef(new Animated.Value(0)).current;
  const floorOpacity = useRef(new Animated.Value(0)).current;
  const dLetterOpacity = useRef(new Animated.Value(0)).current;

  const bgProgress = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const bulletAnims = useRef(
    BULLETS.map(() => new Animated.Value(0))
  ).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(24)).current;

  const introTargetY = -(SCREEN_HEIGHT * 0.18);
  const scaleRatio = LOGO_SIZE_INTRO / LOGO_SIZE_SPLASH;

  const whiteWallOpacity = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const darkWallOpacity = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const combinedWhiteWall = Animated.multiply(wallOpacity, whiteWallOpacity);
  const combinedDarkWall = Animated.multiply(wallOpacity, darkWallOpacity);
  const combinedWhiteFloor = Animated.multiply(floorOpacity, whiteWallOpacity);
  const combinedDarkFloor = Animated.multiply(floorOpacity, darkWallOpacity);

  const startIntroTransition = useCallback(() => {
    Animated.parallel([
      Animated.timing(bgProgress, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(logoScale, {
        toValue: scaleRatio,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(logoTranslateY, {
        toValue: introTargetY,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.stagger(
          70,
          bulletAnims.map((anim) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            })
          )
        ),
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(buttonSlide, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    });
  }, [bgProgress, logoScale, logoTranslateY, brandOpacity, subtitleOpacity, taglineOpacity, bulletAnims, buttonOpacity, buttonSlide, scaleRatio, introTargetY]);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(roofOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(wallOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(floorOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(dLetterOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.delay(300),
    ]).start(() => {
      console.log('[SplashIntro] Line draw complete, transitioning to intro');
      onSplashDone();
      startIntroTransition();
    });
  }, [roofOpacity, wallOpacity, floorOpacity, dLetterOpacity, onSplashDone, startIntroTransition]);

  const bgColor = bgProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.splash, Colors.background],
  });

  const SW = 2.8;

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
          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={roofOpacity}>
            <Polyline
              points="10,48 50,14 90,48"
              fill="none"
              stroke={Colors.accent}
              strokeWidth={SW + 0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </LogoLayer>

          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={combinedWhiteWall}>
            <Line x1="22" y1="42" x2="22" y2="86" stroke="#FFFFFF" strokeWidth={SW} strokeLinecap="round" />
            <Line x1="78" y1="42" x2="78" y2="86" stroke="#FFFFFF" strokeWidth={SW} strokeLinecap="round" />
          </LogoLayer>
          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={combinedDarkWall}>
            <Line x1="22" y1="42" x2="22" y2="86" stroke={Colors.splash} strokeWidth={SW} strokeLinecap="round" />
            <Line x1="78" y1="42" x2="78" y2="86" stroke={Colors.splash} strokeWidth={SW} strokeLinecap="round" />
          </LogoLayer>

          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={combinedWhiteFloor}>
            <Line x1="22" y1="86" x2="78" y2="86" stroke="#FFFFFF" strokeWidth={SW} strokeLinecap="round" />
          </LogoLayer>
          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={combinedDarkFloor}>
            <Line x1="22" y1="86" x2="78" y2="86" stroke={Colors.splash} strokeWidth={SW} strokeLinecap="round" />
          </LogoLayer>

          <LogoLayer size={LOGO_SIZE_SPLASH} opacity={dLetterOpacity}>
            <Path
              d="M 40,56 L 40,72 Q 40,76 44,76 L 56,76 Q 60,76 60,72 L 60,56 Q 60,48 50,48 Q 40,48 40,56 Z"
              fill="none"
              stroke={Colors.accent}
              strokeWidth={SW}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Line
              x1="40" y1="52" x2="40" y2="76"
              stroke={Colors.accent}
              strokeWidth={SW}
              strokeLinecap="round"
            />
          </LogoLayer>
        </Animated.View>
      </View>

      <View
        style={[
          styles.introContent,
          {
            top: SCREEN_HEIGHT * 0.38,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.textBlock}>
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

          <View style={styles.bulletsWrap}>
            {BULLETS.map((bullet, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.bulletRow,
                  { opacity: bulletAnims[index] },
                ]}
              >
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </Animated.View>
            ))}
          </View>
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
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
  },
  logoArea: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logoWrap: {
    width: LOGO_SIZE_SPLASH,
    height: LOGO_SIZE_SPLASH,
  },
  logoLayer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  introContent: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    justifyContent: 'space-between' as const,
  },
  textBlock: {
    alignItems: 'center' as const,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
  },
  taglineWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 24,
    marginBottom: 24,
    gap: 10,
  },
  taglineLine: {
    height: 1,
    width: 20,
    backgroundColor: Colors.border,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
    fontStyle: 'italic' as const,
    letterSpacing: 0.2,
    textAlign: 'center' as const,
  },
  bulletsWrap: {
    alignSelf: 'stretch' as const,
    gap: 10,
    paddingHorizontal: 12,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 1,
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
    marginTop: 32,
    paddingBottom: 8,
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
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      web: {
        shadowColor: Colors.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
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
