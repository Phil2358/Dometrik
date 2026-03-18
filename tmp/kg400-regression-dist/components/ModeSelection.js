import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, } from 'react-native';
import { Home, Ruler, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
const MODE_OPTIONS = [
    {
        id: 'private',
        title: 'Private User',
        description: 'Estimate the construction cost of your future home and explore different building scenarios.',
        icon: _jsx(Home, { size: 28, color: Colors.primary, strokeWidth: 1.8 }),
        accentColor: Colors.primary,
        bgTint: 'rgba(31, 78, 99, 0.08)',
    },
    {
        id: 'professional',
        title: 'Architect / Professional',
        description: 'Use the estimator as a professional planning tool and generate cost reports for clients.',
        icon: _jsx(Ruler, { size: 28, color: Colors.terracotta, strokeWidth: 1.8 }),
        accentColor: Colors.terracotta,
        bgTint: 'rgba(198, 122, 66, 0.08)',
    },
    {
        id: 'guided',
        title: 'Guided Estimate',
        description: 'Follow a guided process to evaluate your project and receive a clearer cost estimate.',
        icon: _jsx(MessageCircle, { size: 28, color: Colors.olive, strokeWidth: 1.8 }),
        accentColor: Colors.olive,
        bgTint: 'rgba(107, 122, 74, 0.06)',
    },
];
export default function ModeSelection({ onSelect }) {
    const insets = useSafeAreaInsets();
    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const cardAnimations = useRef(MODE_OPTIONS.map(() => ({
        opacity: new Animated.Value(0),
        translateY: new Animated.Value(24),
    }))).current;
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
            Animated.stagger(120, cardAnimations.map((anim) => Animated.parallel([
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
            ]))).start();
        });
    }, [fadeIn, slideUp, cardAnimations]);
    const handlePress = (mode) => {
        onSelect(mode);
    };
    return (_jsxs(View, { style: [styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }], children: [_jsxs(Animated.View, { style: [
                    styles.header,
                    {
                        opacity: fadeIn,
                        transform: [{ translateY: slideUp }],
                    },
                ], children: [_jsx(Text, { style: styles.title, children: "Who are you?" }), _jsx(Text, { style: styles.subtitle, children: "Choose the mode that best fits your needs." })] }), _jsx(View, { style: styles.cardsContainer, children: MODE_OPTIONS.map((option, index) => (_jsx(Animated.View, { style: {
                        opacity: cardAnimations[index].opacity,
                        transform: [{ translateY: cardAnimations[index].translateY }],
                    }, children: _jsxs(TouchableOpacity, { style: styles.card, activeOpacity: 0.7, onPress: () => handlePress(option.id), testID: `mode-card-${option.id}`, children: [_jsx(View, { style: [styles.iconCircle, { backgroundColor: option.bgTint }], children: option.icon }), _jsxs(View, { style: styles.cardContent, children: [_jsx(Text, { style: styles.cardTitle, children: option.title }), _jsx(Text, { style: styles.cardDescription, children: option.description })] }), _jsx(View, { style: [styles.arrow, { backgroundColor: option.bgTint }], children: _jsx(Text, { style: [styles.arrowText, { color: option.accentColor }], children: "\u203A" }) })] }) }, option.id))) }), _jsx(Animated.View, { style: [styles.footer, { opacity: fadeIn }], children: _jsx(Text, { style: styles.footerText, children: "You can change this later in Settings." }) })] }));
}
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
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
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: -0.6,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    cardsContainer: {
        gap: 14,
    },
    card: Object.assign({ backgroundColor: Colors.card, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight }, Platform.select({
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
    })),
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardContent: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    arrow: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowText: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: -2,
    },
    footer: {
        marginTop: 36,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        fontWeight: '400',
        color: Colors.textTertiary,
    },
});
