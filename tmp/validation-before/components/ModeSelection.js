"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModeSelection;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const lucide_react_native_1 = require("lucide-react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const colors_1 = __importDefault(require("@/constants/colors"));
const MODE_OPTIONS = [
    {
        id: 'private',
        title: 'Private User',
        description: 'Estimate the construction cost of your future home and explore different building scenarios.',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Home, { size: 28, color: colors_1.default.primary, strokeWidth: 1.8 }),
        accentColor: colors_1.default.primary,
        bgTint: 'rgba(31, 78, 99, 0.08)',
    },
    {
        id: 'professional',
        title: 'Architect / Professional',
        description: 'Use the estimator as a professional planning tool and generate cost reports for clients.',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.Ruler, { size: 28, color: colors_1.default.terracotta, strokeWidth: 1.8 }),
        accentColor: colors_1.default.terracotta,
        bgTint: 'rgba(198, 122, 66, 0.08)',
    },
    {
        id: 'guided',
        title: 'Guided Estimate',
        description: 'Follow a guided process to evaluate your project and receive a clearer cost estimate.',
        icon: (0, jsx_runtime_1.jsx)(lucide_react_native_1.MessageCircle, { size: 28, color: colors_1.default.olive, strokeWidth: 1.8 }),
        accentColor: colors_1.default.olive,
        bgTint: 'rgba(107, 122, 74, 0.06)',
    },
];
function ModeSelection({ onSelect }) {
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const fadeIn = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const slideUp = (0, react_1.useRef)(new react_native_1.Animated.Value(30)).current;
    const cardAnimations = (0, react_1.useRef)(MODE_OPTIONS.map(() => ({
        opacity: new react_native_1.Animated.Value(0),
        translateY: new react_native_1.Animated.Value(24),
    }))).current;
    (0, react_1.useEffect)(() => {
        react_native_1.Animated.parallel([
            react_native_1.Animated.timing(fadeIn, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(slideUp, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            react_native_1.Animated.stagger(120, cardAnimations.map((anim) => react_native_1.Animated.parallel([
                react_native_1.Animated.timing(anim.opacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(anim.translateY, {
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
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: [styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }], children: [(0, jsx_runtime_1.jsxs)(react_native_1.Animated.View, { style: [
                    styles.header,
                    {
                        opacity: fadeIn,
                        transform: [{ translateY: slideUp }],
                    },
                ], children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: "Who are you?" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subtitle, children: "Choose the mode that best fits your needs." })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.cardsContainer, children: MODE_OPTIONS.map((option, index) => ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: {
                        opacity: cardAnimations[index].opacity,
                        transform: [{ translateY: cardAnimations[index].translateY }],
                    }, children: (0, jsx_runtime_1.jsxs)(react_native_1.TouchableOpacity, { style: styles.card, activeOpacity: 0.7, onPress: () => handlePress(option.id), testID: `mode-card-${option.id}`, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.iconCircle, { backgroundColor: option.bgTint }], children: option.icon }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.cardContent, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardTitle, children: option.title }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.cardDescription, children: option.description })] }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [styles.arrow, { backgroundColor: option.bgTint }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.arrowText, { color: option.accentColor }], children: "\u203A" }) })] }) }, option.id))) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [styles.footer, { opacity: fadeIn }], children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.footerText, children: "You can change this later in Settings." }) })] }));
}
const styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors_1.default.background,
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
        color: colors_1.default.text,
        letterSpacing: -0.6,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: colors_1.default.textSecondary,
        lineHeight: 22,
    },
    cardsContainer: {
        gap: 14,
    },
    card: Object.assign({ backgroundColor: colors_1.default.card, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors_1.default.borderLight }, react_native_1.Platform.select({
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
        color: colors_1.default.text,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        fontWeight: '400',
        color: colors_1.default.textSecondary,
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
        color: colors_1.default.textTertiary,
    },
});
