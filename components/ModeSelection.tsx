import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Home, Ruler, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { UserMode } from '@/contexts/UserModeContext';

interface ModeOption {
  id: UserMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgTint: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: 'private',
    title: 'Private User',
    description:
      'Estimate the construction cost of your future home and explore different building scenarios.',
    icon: <Home size={28} color={Colors.primary} strokeWidth={1.8} />,
    accentColor: Colors.primary,
    bgTint: 'rgba(31, 78, 99, 0.08)',
  },
  {
    id: 'professional',
    title: 'Architect / Professional',
    description:
      'Use the estimator as a professional planning tool and generate cost reports for clients.',
    icon: <Ruler size={28} color={Colors.terracotta} strokeWidth={1.8} />,
    accentColor: Colors.terracotta,
    bgTint: 'rgba(242, 161, 50, 0.12)',
  },
  {
    id: 'guided',
    title: 'Guided Estimate',
    description:
      'Follow a guided process to evaluate your project and receive a clearer cost estimate.',
    icon: <MessageCircle size={28} color={Colors.olive} strokeWidth={1.8} />,
    accentColor: Colors.olive,
    bgTint: 'rgba(107, 122, 74, 0.06)',
  },
];

interface ModeSelectionProps {
  onSelect: (mode: UserMode) => void;
}

export default function ModeSelection({ onSelect }: ModeSelectionProps) {
  const insets = useSafeAreaInsets();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const cardAnimations = useRef(
    MODE_OPTIONS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(24),
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.stagger(
        120,
        cardAnimations.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ])
        )
      ).start();
    });
  }, [fadeIn, slideUp, cardAnimations]);

  const handlePress = (mode: UserMode) => {
    onSelect(mode);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeIn,
            transform: [{ translateY: slideUp }],
          },
        ]}
      >
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose the mode that best fits your needs.</Text>
      </Animated.View>

      <View style={styles.cardsContainer}>
        {MODE_OPTIONS.map((option, index) => (
          <Animated.View
            key={option.id}
            style={{
              opacity: cardAnimations[index].opacity,
              transform: [{ translateY: cardAnimations[index].translateY }],
            }}
          >
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => handlePress(option.id)}
              testID={`mode-card-${option.id}`}
            >
              <View style={[styles.iconCircle, { backgroundColor: option.bgTint }]}>
                {option.icon}
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>
              <View style={[styles.arrow, { backgroundColor: option.bgTint }]}>
                <Text style={[styles.arrowText, { color: option.accentColor }]}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeIn }]}>
        <Text style={styles.footerText}>You can change this later in Settings.</Text>
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
    paddingHorizontal: 20,
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 9998,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: '600' as const,
    marginTop: -2,
  },
  footer: {
    marginTop: 36,
    alignItems: 'center' as const,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
});

