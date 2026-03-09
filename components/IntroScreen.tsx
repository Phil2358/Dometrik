import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Home, BarChart3, GitCompare, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface IntroScreenProps {
  onStart: () => void;
}

const BULLETS = [
  { icon: CheckCircle, text: 'Realistic construction cost estimate' },
  { icon: BarChart3, text: 'Professional cost structure (DIN 276)' },
  { icon: GitCompare, text: 'Compare different building scenarios instantly' },
];

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const insets = useSafeAreaInsets();
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(16)).current;
  const bodyFade = useRef(new Animated.Value(0)).current;
  const bodySlide = useRef(new Animated.Value(20)).current;
  const bulletAnims = useRef(
    BULLETS.map(() => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(-16),
    }))
  ).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(bodyFade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(bodySlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.stagger(
        100,
        bulletAnims.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(anim.translateX, { toValue: 0, duration: 300, useNativeDriver: true }),
          ])
        )
      ),
      Animated.parallel([
        Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [logoFade, logoScale, titleFade, titleSlide, bodyFade, bodySlide, bulletAnims, buttonFade, buttonSlide]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.topSection}>
        <Animated.View style={[styles.logoWrap, { opacity: logoFade, transform: [{ scale: logoScale }] }]}>
          <View style={styles.iconContainer}>
            <Home size={36} color="#FFFFFF" strokeWidth={1.6} />
            <Text style={styles.euroOverlay}>€</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }] }}>
          <Text style={styles.appName}>SnapCost</Text>
          <Text style={styles.subtitle}>Construction Cost Estimator</Text>
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: bodyFade, transform: [{ translateY: bodySlide }] }]}>
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Know the cost before you build.</Text>
          <View style={styles.taglineLine} />
        </Animated.View>

        <Animated.View style={[styles.descriptionWrap, { opacity: bodyFade, transform: [{ translateY: bodySlide }] }]}>
          <Text style={styles.description}>
            Estimate the real cost of building a house based on location, size, quality level, and site conditions.
          </Text>
        </Animated.View>

        <View style={styles.bulletsWrap}>
          {BULLETS.map((bullet, index) => {
            const Icon = bullet.icon;
            return (
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
                <View style={styles.bulletIcon}>
                  <Icon size={18} color={Colors.accent} strokeWidth={2} />
                </View>
                <Text style={styles.bulletText}>{bullet.text}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>

      <Animated.View style={[styles.bottomSection, { opacity: buttonFade, transform: [{ translateY: buttonSlide }] }]}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={onStart}
          testID="intro-start-button"
        >
          <Text style={styles.startButtonText}>Start Estimator</Text>
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
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  euroOverlay: {
    position: 'absolute' as const,
    bottom: 10,
    right: 12,
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800' as const,
    color: Colors.primary,
    textAlign: 'center' as const,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 4,
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
    width: 28,
    backgroundColor: Colors.border,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
    fontStyle: 'italic' as const,
    letterSpacing: 0.2,
  },
  descriptionWrap: {
    marginBottom: 28,
    paddingHorizontal: 8,
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
    gap: 14,
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
    }),
  },
  bulletIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 120, 47, 0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
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
