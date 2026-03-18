import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, ScrollView, } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
const LOGO_SIZE_SPLASH = 140;
const LOGO_SIZE_INTRO = 68;
const FRAME_COLOR = '#6A6A6A';
const MARKER_COLOR = '#6A6A6A';
const D_COLOR = '#1F1F1F';
const SPLASH_COLOR_WHITE = '#FFFFFF';
const BULLETS = [
    'Realistic construction cost estimates',
    'Professional cost structure (DIN 276)',
    'Compare building scenarios instantly',
    'Evaluate project feasibility before construction',
];
export default function SplashIntro({ onSplashDone, onStart }) {
    const insets = useSafeAreaInsets();
    const [phase, setPhase] = useState('splash');
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
    const showIntroContent = useCallback(() => {
        console.log('[SplashIntro] Showing intro content');
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
            Animated.stagger(60, bulletAnims.map((anim) => Animated.timing(anim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }))),
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
    }, [brandOpacity, subtitleOpacity, taglineOpacity, bulletAnims, buttonOpacity, buttonSlide]);
    const startTransition = useCallback(() => {
        console.log('[SplashIntro] Starting transition to intro');
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
            setPhase('intro');
            showIntroContent();
        });
        setPhase('transition');
    }, [onSplashDone, splashFadeOut, introFadeIn, showIntroContent]);
    useEffect(() => {
        console.log('[SplashIntro] Starting splash draw animation');
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
            console.log('[SplashIntro] Draw animation complete');
            setTimeout(() => {
                startTransition();
            }, 300);
        });
    }, [frameOpacity, markerOpacity, dLetterOpacity, startTransition]);
    const SW = 9;
    const renderSplashLogo = () => (_jsxs(View, { style: { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH }, children: [_jsx(Animated.View, { style: [styles.svgLayer, { opacity: frameOpacity }], children: _jsx(Svg, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: _jsx(Path, { d: "M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW, strokeLinecap: "square", strokeLinejoin: "round" }) }) }), _jsx(Animated.View, { style: [styles.svgLayer, { opacity: markerOpacity }], children: _jsx(Svg, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: _jsx(Rect, { x: "23", y: "23", width: "8", height: "8", rx: "1", ry: "1", fill: Colors.accent }) }) }), _jsx(Animated.View, { style: [styles.svgLayer, { opacity: dLetterOpacity }], children: _jsxs(Svg, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: [_jsx(Path, { d: "M 46,36 L 46,88", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW + 2, strokeLinecap: "round" }), _jsx(Path, { d: "M 46,36 C 84,36 84,88 46,88", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW + 2, strokeLinecap: "round", strokeLinejoin: "round" })] }) })] }));
    return (_jsxs(View, { style: styles.container, children: [_jsx(Animated.View, { style: [
                    styles.splashScreen,
                    { opacity: splashFadeOut },
                ], pointerEvents: phase === 'splash' ? 'auto' : 'none', children: _jsx(View, { style: styles.splashCenter, children: renderSplashLogo() }) }), _jsx(Animated.View, { style: [
                    styles.introScreen,
                    {
                        opacity: introFadeIn,
                        paddingTop: insets.top + 48,
                        paddingBottom: insets.bottom + 24,
                    },
                ], pointerEvents: phase !== 'splash' ? 'auto' : 'none', children: _jsxs(ScrollView, { contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, bounces: false, children: [_jsx(View, { style: styles.introLogoWrap, children: _jsxs(Svg, { width: LOGO_SIZE_INTRO, height: LOGO_SIZE_INTRO, viewBox: "0 0 100 100", children: [_jsx(Path, { d: "M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9", fill: "none", stroke: FRAME_COLOR, strokeWidth: SW, strokeLinecap: "square", strokeLinejoin: "round" }), _jsx(Rect, { x: "23", y: "23", width: "8", height: "8", rx: "1", ry: "1", fill: MARKER_COLOR }), _jsx(Path, { d: "M 46,36 L 46,88", fill: "none", stroke: D_COLOR, strokeWidth: SW + 2, strokeLinecap: "round" }), _jsx(Path, { d: "M 46,36 C 84,36 84,88 46,88", fill: "none", stroke: D_COLOR, strokeWidth: SW + 2, strokeLinecap: "round", strokeLinejoin: "round" })] }) }), _jsx(View, { style: styles.spacer20 }), _jsx(Animated.Text, { style: [styles.brandName, { opacity: brandOpacity }], children: "Dometrik" }), _jsx(View, { style: styles.spacer8 }), _jsx(Animated.Text, { style: [styles.subtitleText, { opacity: subtitleOpacity }], children: "Construction Cost Estimator" }), _jsx(View, { style: styles.spacer18 }), _jsxs(Animated.View, { style: [styles.taglineWrap, { opacity: taglineOpacity }], children: [_jsx(View, { style: styles.taglineLine }), _jsx(Text, { style: styles.taglineText, children: "Understand the real cost before you build." }), _jsx(View, { style: styles.taglineLine })] }), _jsx(View, { style: styles.spacer24 }), _jsx(View, { style: styles.bulletsWrap, children: BULLETS.map((bullet, index) => (_jsxs(Animated.View, { style: [styles.bulletRow, { opacity: bulletAnims[index] }], children: [_jsx(View, { style: styles.bulletDot }), _jsx(Text, { style: styles.bulletText, children: bullet })] }, index))) }), _jsx(View, { style: styles.spacer32 }), _jsx(Animated.View, { style: [
                                styles.buttonWrap,
                                {
                                    opacity: buttonOpacity,
                                    transform: [{ translateY: buttonSlide }],
                                },
                            ], children: _jsx(TouchableOpacity, { style: styles.startButton, activeOpacity: 0.8, onPress: onStart, testID: "intro-start-button", children: _jsx(Text, { style: styles.startButtonText, children: "Start Estimate" }) }) })] }) })] }));
}
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
    },
    splashScreen: Object.assign(Object.assign({}, StyleSheet.absoluteFillObject), { backgroundColor: Colors.splash, zIndex: 2 }),
    splashCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    svgLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    introScreen: Object.assign(Object.assign({}, StyleSheet.absoluteFillObject), { backgroundColor: Colors.background, zIndex: 1, paddingHorizontal: 24 }),
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
    },
    introLogoWrap: {
        width: LOGO_SIZE_INTRO,
        height: LOGO_SIZE_INTRO,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spacer8: { height: 8 },
    spacer18: { height: 18 },
    spacer20: { height: 20 },
    spacer24: { height: 24 },
    spacer32: { height: 32 },
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
    },
    taglineLine: {
        height: 1,
        width: 18,
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
    },
    startButton: Object.assign({ backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }, Platform.select({
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
    })),
    startButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});
