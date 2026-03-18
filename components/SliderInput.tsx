import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Platform,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface SliderInputProps {
  label: string;
  subtitle: string;
  value: number;
  onChangeValue: (v: number) => void;
  badge?: string;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  testID?: string;
  editable?: boolean;
}

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 6;

export default function SliderInput({
  label,
  subtitle,
  value,
  onChangeValue,
  badge,
  min,
  max,
  step = 1,
  suffix,
  testID,
  editable = true,
}: SliderInputProps) {
  const trackLayoutRef = useRef({ x: 0, y: 0, width: 0 });
  const trackViewRef = useRef<View>(null);
  const thumbScale = useRef(new Animated.Value(1)).current;

  const [localValue, setLocalValue] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const localValueRef = useRef<number | null>(null);
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

  const valueFromPageX = useCallback((pageX: number): number => {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
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
              trackLayoutRef.current = { ...trackLayoutRef.current, x, width };
            }
            const newVal = valueFromPageX(evt.nativeEvent.pageX);
            localValueRef.current = newVal;
            setLocalValue(newVal);
          });
        }
      },
      onPanResponderMove: (evt: GestureResponderEvent, _gestureState: PanResponderGestureState) => {
        if (!isDraggingRef.current) return;
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
    }),
  ).current;

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    trackLayoutRef.current = {
      ...trackLayoutRef.current,
      width: e.nativeEvent.layout.width,
    };
    measureTrack();
  }, [measureTrack]);

  const handleTextChange = useCallback(
    (text: string) => {
      if (!editable) return;
      if (suffix === '%') {
        const cleaned = text.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleaned);
        onChangeValue(isNaN(val) ? 0 : val);
      } else {
        const cleaned = text.replace(/[^0-9]/g, '');
        const val = parseInt(cleaned, 10) || 0;
        onChangeValue(val);
      }
    },
    [editable, onChangeValue, suffix],
  );

  return (
    <View style={sliderStyles.container} testID={testID}>
      <View style={sliderStyles.headerRow}>
        <View style={sliderStyles.labelSection}>
          <View style={sliderStyles.labelRow}>
            <Text style={sliderStyles.label}>{label}</Text>
            {badge && (
              <View style={sliderStyles.badge}>
                <Text style={sliderStyles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={sliderStyles.subtitle}>{subtitle}</Text>
        </View>
        <View style={sliderStyles.inputWrap}>
          <TextInput
            style={[sliderStyles.input, !editable && sliderStyles.inputDisabled]}
            value={displayValue > 0 ? (suffix === '%' ? displayValue.toFixed(1) : String(displayValue)) : ''}
            onChangeText={handleTextChange}
            keyboardType={suffix === '%' ? 'decimal-pad' : 'numeric'}
            editable={editable}
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
            testID={testID ? `${testID}-input` : undefined}
          />
          <Text style={[sliderStyles.unit, !editable && sliderStyles.unitDisabled]}>{suffix ?? 'm²'}</Text>
        </View>
      </View>

      <View
        ref={trackViewRef}
        style={[sliderStyles.sliderArea, !editable && sliderStyles.sliderAreaDisabled]}
        onLayout={onTrackLayout}
        {...(editable ? panResponder.panHandlers : {})}
      >
        <View style={[sliderStyles.track, !editable && sliderStyles.trackDisabled]}>
          <View
            style={[
              sliderStyles.trackFill,
              !editable && sliderStyles.trackFillDisabled,
              { width: `${(fraction * 100).toFixed(1)}%` as unknown as number },
            ]}
          />
        </View>
        <Animated.View
          style={[
            sliderStyles.thumb,
            {
              left: `${(fraction * 100).toFixed(1)}%` as unknown as number,
              transform: [{ scale: thumbScale }, { translateX: -THUMB_SIZE / 2 }],
            },
            !editable && sliderStyles.thumbDisabled,
            isDragging && sliderStyles.thumbActive,
          ]}
        />
      </View>

      <View style={sliderStyles.rangeLabels}>
        <Text style={sliderStyles.rangeText}>{min}</Text>
        <Text style={sliderStyles.rangeText}>{max}</Text>
      </View>
    </View>
  );
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
    fontWeight: '600' as const,
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
    fontWeight: '700' as const,
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
    fontWeight: '600' as const,
    color: Colors.primary,
    minWidth: 50,
    textAlign: 'right' as const,
    padding: 0,
  },
  inputDisabled: {
    color: Colors.textSecondary,
  },
  unit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  unitDisabled: {
    color: Colors.textTertiary,
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
    backgroundColor: Colors.borderLight,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  trackDisabled: {
    backgroundColor: Colors.border,
  },
  trackFill: {
    height: TRACK_HEIGHT,
    backgroundColor: Colors.accent,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFillDisabled: {
    backgroundColor: Colors.textTertiary,
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
  thumbDisabled: {
    borderColor: Colors.textTertiary,
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
    color: Colors.textTertiary,
    fontWeight: '500' as const,
  },
});
