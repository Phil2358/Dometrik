import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, } from 'react-native';
import Colors from '@/constants/colors';
import { formatEuro } from '@/constants/construction';
const VAT_RATE = 0.24;
export default function FloatingCostBadge({ totalCost, vatRate = VAT_RATE, }) {
    const totalInclVat = Math.round(totalCost * (1 + vatRate));
    const [expanded, setExpanded] = useState(false);
    const [displayedCost, setDisplayedCost] = useState(totalInclVat);
    const [delta, setDelta] = useState(0);
    const expandAnim = useRef(new Animated.Value(0)).current;
    const deltaOpacity = useRef(new Animated.Value(0)).current;
    const costScale = useRef(new Animated.Value(1)).current;
    const prevCostRef = useRef(totalInclVat);
    useEffect(() => {
        const prevCost = prevCostRef.current;
        const diff = totalInclVat - prevCost;
        if (diff !== 0) {
            setDelta(diff);
            deltaOpacity.setValue(1);
            Animated.sequence([
                Animated.timing(costScale, {
                    toValue: 1.06,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(costScale, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();
            const steps = 12;
            const stepDuration = 250 / steps;
            const stepValue = diff / steps;
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    setDisplayedCost(totalInclVat);
                    clearInterval(interval);
                }
                else {
                    setDisplayedCost(Math.round(prevCost + stepValue * currentStep));
                }
            }, stepDuration);
            const fadeTimer = setTimeout(() => {
                Animated.timing(deltaOpacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }).start();
            }, 1200);
            prevCostRef.current = totalInclVat;
            return () => {
                clearInterval(interval);
                clearTimeout(fadeTimer);
            };
        }
        else {
            setDisplayedCost(totalInclVat);
        }
        prevCostRef.current = totalInclVat;
    }, [totalInclVat, deltaOpacity, costScale]);
    const toggleExpand = useCallback(() => {
        const toValue = expanded ? 0 : 1;
        setExpanded(!expanded);
        Animated.spring(expandAnim, {
            toValue,
            useNativeDriver: false,
            friction: 9,
            tension: 65,
        }).start();
    }, [expanded, expandAnim]);
    const badgeHeight = expandAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [42, 78],
    });
    const labelOpacity = expandAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });
    const vatLabelOpacity = expandAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });
    return (_jsx(View, { style: badgeStyles.wrapper, pointerEvents: "box-none", children: _jsx(TouchableOpacity, { activeOpacity: 0.85, onPress: toggleExpand, testID: "floating-cost-badge", children: _jsxs(Animated.View, { style: [badgeStyles.badge, { height: badgeHeight }], children: [_jsx(Animated.Text, { style: [badgeStyles.label, { opacity: labelOpacity }], children: "Total Project Cost" }), _jsxs(View, { style: badgeStyles.costRow, children: [_jsx(Animated.Text, { style: [
                                    badgeStyles.cost,
                                    { transform: [{ scale: costScale }] },
                                ], children: formatEuro(displayedCost) }), _jsx(Animated.View, { style: [badgeStyles.deltaWrap, { opacity: deltaOpacity }], children: delta !== 0 && (_jsxs(Text, { style: [
                                        badgeStyles.deltaText,
                                        delta > 0 ? badgeStyles.deltaUp : badgeStyles.deltaDown,
                                    ], children: [delta > 0 ? '+' : '', formatEuro(delta)] })) })] }), _jsx(Animated.Text, { style: [badgeStyles.vatLabel, { opacity: vatLabelOpacity }], children: "incl. VAT (24%)" })] }) }) }));
}
const badgeStyles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 8 : 8,
        right: 12,
        zIndex: 100,
    },
    badge: {
        backgroundColor: Colors.hero,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
        minWidth: 130,
        overflow: 'hidden',
    },
    label: {
        fontSize: 9,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 1,
    },
    costRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cost: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.heroText,
        letterSpacing: -0.5,
    },
    deltaWrap: {
        position: 'absolute',
        right: 0,
        top: -12,
    },
    deltaText: {
        fontSize: 10,
        fontWeight: '700',
    },
    deltaUp: {
        color: '#FCA5A5',
    },
    deltaDown: {
        color: '#86EFAC',
    },
    vatLabel: {
        fontSize: 9,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.5)',
        marginTop: 1,
    },
});
