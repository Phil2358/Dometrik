"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SplashIntro;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const colors_1 = __importDefault(require("@/constants/colors"));
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
function SplashIntro({ onSplashDone, onStart }) {
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [phase, setPhase] = (0, react_1.useState)('splash');
    const frameOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const markerOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const dLetterOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const splashFadeOut = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const introFadeIn = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const brandOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const subtitleOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const taglineOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const bulletAnims = (0, react_1.useRef)(BULLETS.map(() => new react_native_1.Animated.Value(0))).current;
    const buttonOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const buttonSlide = (0, react_1.useRef)(new react_native_1.Animated.Value(20)).current;
    const showIntroContent = (0, react_1.useCallback)(() => {
        console.log('[SplashIntro] Showing intro content');
        react_native_1.Animated.sequence([
            react_native_1.Animated.timing(brandOpacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            react_native_1.Animated.stagger(60, bulletAnims.map((anim) => react_native_1.Animated.timing(anim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }))),
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(buttonSlide, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [brandOpacity, subtitleOpacity, taglineOpacity, bulletAnims, buttonOpacity, buttonSlide]);
    const startTransition = (0, react_1.useCallback)(() => {
        console.log('[SplashIntro] Starting transition to intro');
        onSplashDone();
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(splashFadeOut, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(introFadeIn, {
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
    (0, react_1.useEffect)(() => {
        console.log('[SplashIntro] Starting splash draw animation');
        react_native_1.Animated.parallel([
            react_native_1.Animated.sequence([
                react_native_1.Animated.delay(100),
                react_native_1.Animated.timing(frameOpacity, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.sequence([
                react_native_1.Animated.delay(600),
                react_native_1.Animated.timing(markerOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.sequence([
                react_native_1.Animated.delay(1200),
                react_native_1.Animated.timing(dLetterOpacity, {
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
    const renderSplashLogo = () => ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH }, children: [(0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles.svgLayer, { opacity: frameOpacity }], children: (0, jsx_runtime_1.jsx)(react_native_svg_1.default, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW, strokeLinecap: "square", strokeLinejoin: "round" }) }) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles.svgLayer, { opacity: markerOpacity }], children: (0, jsx_runtime_1.jsx)(react_native_svg_1.default, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "23", y: "23", width: "8", height: "8", rx: "1", ry: "1", fill: colors_1.default.accent }) }) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles.svgLayer, { opacity: dLetterOpacity }], children: (0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH, viewBox: "0 0 100 100", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 46,36 L 46,88", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW + 2, strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 46,36 C 84,36 84,88 46,88", fill: "none", stroke: SPLASH_COLOR_WHITE, strokeWidth: SW + 2, strokeLinecap: "round", strokeLinejoin: "round" })] }) })] }));
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                    styles.splashScreen,
                    { opacity: splashFadeOut },
                ], pointerEvents: phase === 'splash' ? 'auto' : 'none', children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.splashCenter, children: renderSplashLogo() }) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                    styles.introScreen,
                    {
                        opacity: introFadeIn,
                        paddingTop: insets.top + 48,
                        paddingBottom: insets.bottom + 24,
                    },
                ], pointerEvents: phase !== 'splash' ? 'auto' : 'none', children: (0, jsx_runtime_1.jsxs)(react_native_1.ScrollView, { contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false, bounces: false, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.introLogoWrap, children: (0, jsx_runtime_1.jsxs)(react_native_svg_1.default, { width: LOGO_SIZE_INTRO, height: LOGO_SIZE_INTRO, viewBox: "0 0 100 100", children: [(0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 28,92 L 9,92 L 9,20 Q 9,9 20,9 L 92,9", fill: "none", stroke: FRAME_COLOR, strokeWidth: SW, strokeLinecap: "square", strokeLinejoin: "round" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Rect, { x: "23", y: "23", width: "8", height: "8", rx: "1", ry: "1", fill: MARKER_COLOR }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 46,36 L 46,88", fill: "none", stroke: D_COLOR, strokeWidth: SW + 2, strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)(react_native_svg_1.Path, { d: "M 46,36 C 84,36 84,88 46,88", fill: "none", stroke: D_COLOR, strokeWidth: SW + 2, strokeLinecap: "round", strokeLinejoin: "round" })] }) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.spacer20 }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.Text, { style: [styles.brandName, { opacity: brandOpacity }], children: "Dometrik" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.spacer8 }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.Text, { style: [styles.subtitleText, { opacity: subtitleOpacity }], children: "Construction Cost Estimator" }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.spacer18 }), (0, jsx_runtime_1.jsxs)(react_native_1.Animated.View, { style: [styles.taglineWrap, { opacity: taglineOpacity }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.taglineLine }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.taglineText, children: "Understand the real cost before you build." }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.taglineLine })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.spacer24 }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bulletsWrap, children: BULLETS.map((bullet, index) => ((0, jsx_runtime_1.jsxs)(react_native_1.Animated.View, { style: [styles.bulletRow, { opacity: bulletAnims[index] }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.bulletDot }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.bulletText, children: bullet })] }, index))) }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.spacer32 }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                                styles.buttonWrap,
                                {
                                    opacity: buttonOpacity,
                                    transform: [{ translateY: buttonSlide }],
                                },
                            ], children: (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: styles.startButton, activeOpacity: 0.8, onPress: onStart, testID: "intro-start-button", children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.startButtonText, children: "Start Estimate" }) }) })] }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 9999,
    },
    splashScreen: Object.assign(Object.assign({}, react_native_1.StyleSheet.absoluteFillObject), { backgroundColor: colors_1.default.splash, zIndex: 2 }),
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
    introScreen: Object.assign(Object.assign({}, react_native_1.StyleSheet.absoluteFillObject), { backgroundColor: colors_1.default.background, zIndex: 1, paddingHorizontal: 24 }),
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
        color: colors_1.default.text,
        textAlign: 'center',
        letterSpacing: 0.6,
    },
    subtitleText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors_1.default.textSecondary,
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
        backgroundColor: colors_1.default.border,
    },
    taglineText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors_1.default.accent,
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
        backgroundColor: colors_1.default.accent,
        marginRight: 12,
    },
    bulletText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors_1.default.text,
        flex: 1,
        lineHeight: 22,
    },
    buttonWrap: {
        alignSelf: 'stretch',
        paddingHorizontal: 8,
    },
    startButton: Object.assign({ backgroundColor: colors_1.default.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }, react_native_1.Platform.select({
        ios: {
            shadowColor: colors_1.default.accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
        },
        android: { elevation: 6 },
        web: {
            shadowColor: colors_1.default.accent,
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
