import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { formatEuro } from '@/constants/construction';
export default function HeaderCostDisplay({ totalCost, }) {
    const [displayedCost, setDisplayedCost] = useState(totalCost);
    const [delta, setDelta] = useState(null);
    const costScale = useRef(new Animated.Value(1)).current;
    const deltaOpacity = useRef(new Animated.Value(0)).current;
    const prevCostRef = useRef(totalCost);
    const deltaTimerRef = useRef(null);
    useEffect(() => {
        const prevCost = prevCostRef.current;
        const diff = totalCost - prevCost;
        if (diff !== 0) {
            Animated.sequence([
                Animated.timing(costScale, {
                    toValue: 1.05,
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
            const stepDuration = 300 / steps;
            const stepValue = diff / steps;
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    setDisplayedCost(totalCost);
                    clearInterval(interval);
                }
                else {
                    setDisplayedCost(Math.round(prevCost + stepValue * currentStep));
                }
            }, stepDuration);
            setDelta(diff);
            deltaOpacity.setValue(1);
            if (deltaTimerRef.current)
                clearTimeout(deltaTimerRef.current);
            deltaTimerRef.current = setTimeout(() => {
                Animated.timing(deltaOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => setDelta(null));
            }, 800);
            prevCostRef.current = totalCost;
            return () => {
                clearInterval(interval);
            };
        }
        else {
            setDisplayedCost(totalCost);
        }
        prevCostRef.current = totalCost;
    }, [totalCost, costScale, deltaOpacity]);
    const deltaText = delta !== null
        ? `${delta > 0 ? '+' : ''}${formatEuro(delta)}`
        : '';
    return (_jsxs(View, { style: headerStyles.container, children: [_jsx(Text, { style: headerStyles.label, children: "DOMETRIK" }), _jsx(Animated.Text, { style: [
                    headerStyles.cost,
                    { transform: [{ scale: costScale }] },
                ], numberOfLines: 1, children: formatEuro(displayedCost) }), delta !== null && (_jsx(Animated.Text, { style: [
                    headerStyles.delta,
                    { opacity: deltaOpacity },
                    delta > 0 ? headerStyles.deltaUp : headerStyles.deltaDown,
                ], numberOfLines: 1, children: deltaText }))] }));
}
const headerStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: 1.2,
    },
    cost: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        fontVariant: ['tabular-nums'],
        marginTop: 1,
    },
    delta: {
        fontSize: 12,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        marginTop: 1,
    },
    deltaUp: {
        color: '#FCA5A5',
    },
    deltaDown: {
        color: '#86EFAC',
    },
});
