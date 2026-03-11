import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const LOGO_SIZE_SPLASH = 140;
const LOGO_SIZE_INTRO = 68;

const FRAME_COLOR = "#6A6A6A";
const MARKER_COLOR = "#6A6A6A";
const D_COLOR = "#1F1F1F";

const SPLASH_COLOR_WHITE = "#FFFFFF";

const BULLETS = [
  "Realistic construction cost estimates",
  "Professional cost structure (DIN 276)",
  "Compare building scenarios instantly",
  "Evaluate project feasibility before construction",
];

interface SplashIntroProps {
  onSplashDone: () => void;
  onStart: () => void;
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<"splash" | "transition" | "intro">("splash");

  const frameOpacity = useRef(new Animated.Value(0)).current;
  const markerOpacity = useRef(new Animated.Value(0)).current;
  const dLetterOpacity = useRef(new Animated.Value(0)).current;

  const splashFadeOut = useRef(new Animated.Value(1)).current;
  const introFadeIn = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const bulletAnims = useRef(BULLETS.map(() => new Animated.Value(0))).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  const SW = 6;

  const showIntroContent = useCallback(() => {
    Animated.sequence([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),

      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 200,
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
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const startTransition = useCallback(() => {
    onSplashDone();

    Animated.parallel([
      Animated.timing(splashFadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(introFadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPhase("intro");
      showIntroContent();
    });

    setPhase("transition");
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(frameOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),

      Animated.sequence([
        Animated.delay(600),
        Animated.timing(markerOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),

      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(dLetterOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        startTransition();
      }, 300);
    });
  }, []);

  const renderSplashLogo = () => (
    <View style={{ width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH }}>
      {/* FRAME */}
      <Animated.View style={[styles.svgLayer, { opacity: frameOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
          <Path
            d="M 32,88 L 16,88 L 16,24 Q 16,16 24,16 L 88,16"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </Svg>
      </Animated.View>

      {/* MARKER */}
      <Animated.View style={[styles.svgLayer, { opacity: markerOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
          <Rect
            x="26"
            y="26"
            width="9"
            height="9"
            rx="1.5"
            ry="1.5"
            fill={Colors.accent}
          />
        </Svg>
      </Animated.View>

      {/* D LETTER */}
      <Animated.View style={[styles.svgLayer, { opacity: dLetterOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
          <Path
            d="M 48,34 L 48,86"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW + 1}
            strokeLinecap="square"
          />

          <Path
            d="M 48,34 C 78,34 78,86 48,86"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW + 1}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </Svg>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.splashScreen, { opacity: splashFadeOut }]}>
        <View style={styles.splashCenter}>{renderSplashLogo()}</View>
      </Animated.View>

      <Animated.View
        style={[
          styles.introScreen,
          {
            opacity: introFadeIn,
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.introLogoWrap}>
            <Svg width={LOGO_SIZE_INTRO} height={LOGO_SIZE_INTRO} viewBox="0 0 100 100">
              <Path
                d="M 32,88 L 16,88 L 16,24 Q 16,16 24,16 L 88,16"
                fill="none"
                stroke={FRAME_COLOR}
                strokeWidth={SW}
                strokeLinecap="square"
              />
              <Rect x="26" y="26" width="9" height="9" rx="1.5" ry="1.5" fill={MARKER_COLOR} />
              <Path
                d="M 48,34 L 48,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={SW + 1}
                strokeLinecap="square"
              />
              <Path
                d="M 48,34 C 78,34 78,86 48,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={SW + 1}
                strokeLinecap="square"
              />
            </Svg>
          </View>

          <Text style={styles.brandName}>Dometrik</Text>
          <Text style={styles.subtitleText}>Construction Cost Estimator</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject },
  splashScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.splash },
  splashCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  svgLayer: { position: "absolute", top: 0, left: 0 },

  introScreen: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.background, paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, alignItems: "center", justifyContent: "center" },

  introLogoWrap: { width: LOGO_SIZE_INTRO, height: LOGO_SIZE_INTRO },

  brandName: {
    fontSize: 34,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 20,
  },

  subtitleText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
});