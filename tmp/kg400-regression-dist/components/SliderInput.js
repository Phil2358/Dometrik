import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, PanResponder, Animated, Platform, } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;
export default function SliderInput({ label, subtitle, value, onChangeValue, badge, min, max, step = 1, suffix, testID, }) {
    const trackLayoutRef = useRef({ x: 0, y: 0, width: 0 });
    const trackViewRef = useRef(null);
    const thumbScale = useRef(new Animated.Value(1)).current;
    const [localValue, setLocalValue] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const localValueRef = useRef(null);
    const isDraggingRef = useRef(false);
    const onChangeValueRef = useRef(onChangeValue);
    const minRef = useRef(min);
    const maxRef = useRef(max);
    const stepRef = useRef(step);
    const valueRef = useRef(value);
    useEffect(() => { onChangeValueRef.current = onChangeValue; }, [onChangeValue]);
    useEffect(() => { minRef.current = min; }, [min]);
    useEffect(() => { maxRef.current = max; }, [max]);
    useEffect(() => { stepRef.current = step; }, [step]);
    useEffect(() => { valueRef.current = value; }, [value]);
    const displayValue = localValue !== null ? localValue : value;
    const clampedValue = Math.min(Math.max(displayValue, min), max);
    const fraction = max > min ? (clampedValue - min) / (max - min) : 0;
    const valueFromPageX = useCallback((pageX) => {
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
    const measureTrack = useCallback(() => {
        if (trackViewRef.current) {
            trackViewRef.current.measureInWindow((x, _y2, width, _h2) => {
                if (width > 0) {
                    trackLayoutRef.current = { x, y: 0, width };
                }
            });
        }
    }, []);
    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
            isDraggingRef.current = true;
            setIsDragging(true);
            Animated.spring(thumbScale, {
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
            Animated.spring(thumbScale, {
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
            if (Platform.OS !== 'web') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
        },
        onPanResponderTerminate: () => {
            isDraggingRef.current = false;
            setIsDragging(false);
            Animated.spring(thumbScale, {
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
    const onTrackLayout = useCallback((e) => {
        trackLayoutRef.current = Object.assign(Object.assign({}, trackLayoutRef.current), { width: e.nativeEvent.layout.width });
        measureTrack();
    }, [measureTrack]);
    const handleTextChange = useCallback((text) => {
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
    }, [onChangeValue, suffix]);
    return (_jsxs(View, { style: sliderStyles.container, testID: testID, children: [_jsxs(View, { style: sliderStyles.headerRow, children: [_jsxs(View, { style: sliderStyles.labelSection, children: [_jsxs(View, { style: sliderStyles.labelRow, children: [_jsx(Text, { style: sliderStyles.label, children: label }), badge && (_jsx(View, { style: sliderStyles.badge, children: _jsx(Text, { style: sliderStyles.badgeText, children: badge }) }))] }), _jsx(Text, { style: sliderStyles.subtitle, children: subtitle })] }), _jsxs(View, { style: sliderStyles.inputWrap, children: [_jsx(TextInput, { style: sliderStyles.input, value: displayValue > 0 ? (suffix === '%' ? displayValue.toFixed(1) : String(displayValue)) : '', onChangeText: handleTextChange, keyboardType: suffix === '%' ? 'decimal-pad' : 'numeric', placeholder: "0", placeholderTextColor: Colors.textTertiary, testID: testID ? `${testID}-input` : undefined }), _jsx(Text, { style: sliderStyles.unit, children: suffix !== null && suffix !== void 0 ? suffix : 'm²' })] })] }), _jsxs(View, Object.assign({ ref: trackViewRef, style: sliderStyles.sliderArea, onLayout: onTrackLayout }, panResponder.panHandlers, { children: [_jsx(View, { style: sliderStyles.track, children: _jsx(View, { style: [
                                sliderStyles.trackFill,
                                { width: `${(fraction * 100).toFixed(1)}%` },
                            ] }) }), _jsx(Animated.View, { style: [
                            sliderStyles.thumb,
                            {
                                left: `${(fraction * 100).toFixed(1)}%`,
                                transform: [{ scale: thumbScale }, { translateX: -THUMB_SIZE / 2 }],
                            },
                            isDragging && sliderStyles.thumbActive,
                        ] })] })), _jsxs(View, { style: sliderStyles.rangeLabels, children: [_jsx(Text, { style: sliderStyles.rangeText, children: min }), _jsx(Text, { style: sliderStyles.rangeText, children: max })] })] }));
}
const sliderStyles = StyleSheet.create({
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
        color: Colors.text,
        flexShrink: 1,
    },
    badge: {
        backgroundColor: Colors.accentLight,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.accent,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginTop: 2,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    input: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        minWidth: 50,
        textAlign: 'right',
        padding: 0,
    },
    unit: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    sliderArea: {
        height: 40,
        justifyContent: 'center',
        marginTop: 8,
        paddingHorizontal: THUMB_SIZE / 2,
    },
    track: {
        height: TRACK_HEIGHT,
        backgroundColor: Colors.borderLight,
        borderRadius: TRACK_HEIGHT / 2,
        overflow: 'hidden',
    },
    trackFill: {
        height: TRACK_HEIGHT,
        backgroundColor: Colors.accent,
        borderRadius: TRACK_HEIGHT / 2,
    },
    thumb: {
        position: 'absolute',
        top: (40 - THUMB_SIZE) / 2,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: Colors.white,
        borderWidth: 2.5,
        borderColor: Colors.accent,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbActive: {
        borderColor: Colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: THUMB_SIZE / 2,
        marginTop: 2,
    },
    rangeText: {
        fontSize: 10,
        color: Colors.textTertiary,
        fontWeight: '500',
    },
});
