"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeaderCostDisplay;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const construction_1 = require("@/constants/construction");
function HeaderCostDisplay({ totalCost, vatAmount, }) {
    const [displayedCost, setDisplayedCost] = (0, react_1.useState)(totalCost);
    const [delta, setDelta] = (0, react_1.useState)(null);
    const costScale = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const deltaOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const prevCostRef = (0, react_1.useRef)(totalCost);
    const deltaTimerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const prevCost = prevCostRef.current;
        const diff = totalCost - prevCost;
        if (diff !== 0) {
            react_native_1.Animated.sequence([
                react_native_1.Animated.timing(costScale, {
                    toValue: 1.05,
                    duration: 120,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(costScale, {
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
                react_native_1.Animated.timing(deltaOpacity, {
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
        ? `${delta > 0 ? '+' : ''}${(0, construction_1.formatEuro)(delta)}`
        : '';
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: headerStyles.container, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: headerStyles.label, children: "DOMETRIK" }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: headerStyles.costRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.Animated.Text, { style: [
                            headerStyles.cost,
                            { transform: [{ scale: costScale }] },
                        ], numberOfLines: 1, children: (0, construction_1.formatEuro)(displayedCost) }), typeof vatAmount === 'number' && ((0, jsx_runtime_1.jsxs)(react_native_1.Text, { style: headerStyles.vatText, numberOfLines: 1, children: ["+ ", (0, construction_1.formatEuro)(vatAmount), " VAT"] }))] }), delta !== null && ((0, jsx_runtime_1.jsx)(react_native_1.Animated.Text, { style: [
                    headerStyles.delta,
                    { opacity: deltaOpacity },
                    delta > 0 ? headerStyles.deltaUp : headerStyles.deltaDown,
                ], numberOfLines: 1, children: deltaText }))] }));
}
const headerStyles = react_native_1.StyleSheet.create({
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
    costRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        columnGap: 8,
        rowGap: 2,
    },
    vatText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.72)',
        fontVariant: ['tabular-nums'],
        marginTop: 4,
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
