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
exports.default = SliderInput;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const Haptics = __importStar(require("expo-haptics"));
const colors_1 = __importDefault(require("@/constants/colors"));
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;
function SliderInput({ label, subtitle, value, onChangeValue, badge, min, max, step = 1, suffix, testID, editable = true, }) {
    const trackLayoutRef = (0, react_1.useRef)({ x: 0, y: 0, width: 0 });
    const trackViewRef = (0, react_1.useRef)(null);
    const thumbScale = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const [localValue, setLocalValue] = (0, react_1.useState)(null);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const localValueRef = (0, react_1.useRef)(null);
    const isDraggingRef = (0, react_1.useRef)(false);
    const onChangeValueRef = (0, react_1.useRef)(onChangeValue);
    const minRef = (0, react_1.useRef)(min);
    const maxRef = (0, react_1.useRef)(max);
    const stepRef = (0, react_1.useRef)(step);
    const valueRef = (0, react_1.useRef)(value);
    (0, react_1.useEffect)(() => { onChangeValueRef.current = onChangeValue; }, [onChangeValue]);
    (0, react_1.useEffect)(() => { minRef.current = min; }, [min]);
    (0, react_1.useEffect)(() => { maxRef.current = max; }, [max]);
    (0, react_1.useEffect)(() => { stepRef.current = step; }, [step]);
    (0, react_1.useEffect)(() => { valueRef.current = value; }, [value]);
    const displayValue = localValue !== null ? localValue : value;
    const clampedValue = Math.min(Math.max(displayValue, min), max);
    const fraction = max > min ? (clampedValue - min) / (max - min) : 0;
    const valueFromPageX = (0, react_1.useCallback)((pageX) => {
        const trackWidth = trackLayoutRef.current.width;
        const trackX = trackLayoutRef.current.x;
        const effectiveWidth = trackWidth - THUMB_SIZE;
        const relativeX = pageX - trackX - THUMB_SIZE / 2;
        const clamped = Math.min(Math.max(relativeX, 0), effectiveWidth);
        const ratio = effectiveWidth > 0 ? clamped / effectiveWidth : 0;
        const currentMin = minRef.current;
        const currentMax = maxRef.current;
        const currentStep = stepRef.current;
        let raw = currentMin + ratio * (currentMax - currentMin);
        raw = Math.round(raw / currentStep) * currentStep;
        return Math.min(Math.max(raw, currentMin), currentMax);
    }, []);
    const measureTrack = (0, react_1.useCallback)(() => {
        if (trackViewRef.current) {
            trackViewRef.current.measureInWindow((x, _y2, width, _h2) => {
                if (width > 0) {
                    trackLayoutRef.current = { x, y: 0, width };
                }
            });
        }
    }, []);
    const panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            isDraggingRef.current = true;
            setIsDragging(true);
            react_native_1.Animated.spring(thumbScale, {
                toValue: 1.3,
                useNativeDriver: true,
                friction: 8,
            }).start();
            if (trackViewRef.current) {
                trackViewRef.current.measureInWindow((x, _y, width, _h) => {
                    if (width > 0) {
                        trackLayoutRef.current = Object.assign(Object.assign({}, trackLayoutRef.current), { x, width });
                    }
                    const newVal = valueFromPageX(evt.nativeEvent.pageX);
                    localValueRef.current = newVal;
                    setLocalValue(newVal);
                });
            }
        },
        onPanResponderMove: (evt, _gestureState) => {
            if (!isDraggingRef.current)
                return;
            const newVal = valueFromPageX(evt.nativeEvent.pageX);
            if (newVal !== localValueRef.current) {
                localValueRef.current = newVal;
                setLocalValue(newVal);
            }
        },
        onPanResponderRelease: () => {
            isDraggingRef.current = false;
            setIsDragging(false);
            react_native_1.Animated.spring(thumbScale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
            }).start();
            const finalValue = localValueRef.current;
            if (finalValue !== null) {
                onChangeValueRef.current(finalValue);
            }
            localValueRef.current = null;
            setLocalValue(null);
            if (react_native_1.Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        },
        onPanResponderTerminate: () => {
            isDraggingRef.current = false;
            setIsDragging(false);
            react_native_1.Animated.spring(thumbScale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 8,
            }).start();
            const finalValue = localValueRef.current;
            if (finalValue !== null) {
                onChangeValueRef.current(finalValue);
            }
            localValueRef.current = null;
            setLocalValue(null);
        },
    })).current;
    const onTrackLayout = (0, react_1.useCallback)((e) => {
        trackLayoutRef.current = Object.assign(Object.assign({}, trackLayoutRef.current), { width: e.nativeEvent.layout.width });
        measureTrack();
    }, [measureTrack]);
    const handleTextChange = (0, react_1.useCallback)((text) => {
        if (!editable)
            return;
        if (suffix === '%') {
            const cleaned = text.replace(/[^0-9.]/g, '');
            const val = parseFloat(cleaned);
            onChangeValue(isNaN(val) ? 0 : val);
        }
        else {
            const cleaned = text.replace(/[^0-9]/g, '');
            const val = parseInt(cleaned, 10) || 0;
            onChangeValue(val);
        }
    }, [editable, onChangeValue, suffix]);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.container, testID: testID, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.headerRow, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.labelSection, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.labelRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: sliderStyles.label, children: label }), badge && ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: sliderStyles.badge, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: sliderStyles.badgeText, children: badge }) }))] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: sliderStyles.subtitle, children: subtitle })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.inputWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { style: [sliderStyles.input, !editable && sliderStyles.inputDisabled], value: displayValue > 0 ? (suffix === '%' ? displayValue.toFixed(1) : String(displayValue)) : '', onChangeText: handleTextChange, keyboardType: suffix === '%' ? 'decimal-pad' : 'numeric', editable: editable, placeholder: "0", placeholderTextColor: colors_1.default.textTertiary, testID: testID ? `${testID}-input` : undefined }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [sliderStyles.unit, !editable && sliderStyles.unitDisabled], children: suffix !== null && suffix !== void 0 ? suffix : 'm²' })] })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, Object.assign({ ref: trackViewRef, style: [sliderStyles.sliderArea, !editable && sliderStyles.sliderAreaDisabled], onLayout: onTrackLayout }, (editable ? panResponder.panHandlers : {}), { children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: [sliderStyles.track, !editable && sliderStyles.trackDisabled], children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                                sliderStyles.trackFill,
                                !editable && sliderStyles.trackFillDisabled,
                                { width: `${(fraction * 100).toFixed(1)}%` },
                            ] }) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                            sliderStyles.thumb,
                            {
                                left: `${(fraction * 100).toFixed(1)}%`,
                                transform: [{ scale: thumbScale }, { translateX: -THUMB_SIZE / 2 }],
                            },
                            !editable && sliderStyles.thumbDisabled,
                            isDragging && sliderStyles.thumbActive,
                        ] })] })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: sliderStyles.rangeLabels, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: sliderStyles.rangeText, children: min }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: sliderStyles.rangeText, children: max })] })] }));
}
const sliderStyles = react_native_1.StyleSheet.create({
    container: {
        paddingVertical: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    labelSection: {
        flex: 1,
        flexShrink: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors_1.default.text,
        flexShrink: 1,
    },
    badge: {
        backgroundColor: colors_1.default.accentLight,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors_1.default.accent,
    },
    subtitle: {
        fontSize: 12,
        color: colors_1.default.textTertiary,
        marginTop: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors_1.default.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
        color: colors_1.default.primary,
        minWidth: 50,
        textAlign: 'right',
        padding: 0,
    },
    inputDisabled: {
        color: colors_1.default.textSecondary,
    },
    unit: {
        fontSize: 13,
        color: colors_1.default.textSecondary,
        marginLeft: 4,
    },
    unitDisabled: {
        color: colors_1.default.textTertiary,
    },
    sliderArea: {
        height: 40,
        justifyContent: 'center',
        marginTop: 8,
        paddingHorizontal: THUMB_SIZE / 2,
    },
    sliderAreaDisabled: {
        opacity: 0.75,
    },
    track: {
        height: TRACK_HEIGHT,
        backgroundColor: colors_1.default.borderLight,
        borderRadius: TRACK_HEIGHT / 2,
        overflow: 'hidden',
    },
    trackDisabled: {
        backgroundColor: colors_1.default.border,
    },
    trackFill: {
        height: TRACK_HEIGHT,
        backgroundColor: colors_1.default.accent,
        borderRadius: TRACK_HEIGHT / 2,
    },
    trackFillDisabled: {
        backgroundColor: colors_1.default.textTertiary,
    },
    thumb: {
        position: 'absolute',
        top: (40 - THUMB_SIZE) / 2,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: colors_1.default.white,
        borderWidth: 2.5,
        borderColor: colors_1.default.accent,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbActive: {
        borderColor: colors_1.default.primary,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    thumbDisabled: {
        borderColor: colors_1.default.textTertiary,
        shadowOpacity: 0.05,
        elevation: 1,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: THUMB_SIZE / 2,
        marginTop: 2,
    },
    rangeText: {
        fontSize: 10,
        color: colors_1.default.textTertiary,
        fontWeight: '500',
    },
});
