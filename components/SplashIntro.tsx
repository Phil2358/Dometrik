import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
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

interface SplashIntroProps {
  onSplashDone: () => void;
  onStart: () => void;
}

export default function SplashIntro({ onSplashDone, onStart }: SplashIntroProps) {

  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'splash' | 'transition' | 'intro'>('splash');

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

  const SW = 6.5;

  const showIntroContent = useCallback(() => {

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

      Animated.stagger(
        60,
        bulletAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          })
        )
      ),

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
      setTimeout(() => {
        startTransition();
      }, 300);
    });

  }, [frameOpacity, markerOpacity, dLetterOpacity, startTransition]);

  const renderSplashLogo = () => (

    <View style={{ width: LOGO_SIZE_SPLASH, height: LOGO_SIZE_SPLASH }}>

      {/* FRAME */}
      <Animated.View style={[styles.svgLayer, { opacity: frameOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
          <Path
            d="M 30,88 L 13,88 L 13,22 Q 13,13 22,13 L 88,13"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW}
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </Svg>
      </Animated.View>

      {/* MARKER */}
      <Animated.View style={[styles.svgLayer, { opacity: markerOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
          <Rect
            x="25.5"
            y="25.5"
            width="9"
            height="9"
            rx="1.5"
            ry="1.5"
            fill={Colors.accent}
          />
        </Svg>
      </Animated.View>

      {/* D LETTER */}
      <Animated.View style={[styles.svgLayer, { opacity: dLetterOpacity }]}>
        <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">

          <Path
            d="M 48,34 L 48,86"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW + 2}
            strokeLinecap="round"
          />

          <Path
            d="M 48,34 C 72,34 72,86 48,86"
            fill="none"
            stroke={SPLASH_COLOR_WHITE}
            strokeWidth={SW + 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

        </Svg>
      </Animated.View>

    </View>

  );

  return (
    <View style={styles.container}>

      {/* SPLASH */}
      <Animated.View
        style={[styles.splashScreen, { opacity: splashFadeOut }]}
        pointerEvents={phase === 'splash' ? 'auto' : 'none'}
      >
        <View style={styles.splashCenter}>
          {renderSplashLogo()}
        </View>
      </Animated.View>

      {/* INTRO */}
      <Animated.View
        style={[
          styles.introScreen,
          {
            opacity: introFadeIn,
            paddingTop: insets.top + 48,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        pointerEvents={phase !== 'splash' ? 'auto' : 'none'}
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          {/* STATIC LOGO */}
          <View style={styles.introLogoWrap}>
            <Svg width={LOGO_SIZE_INTRO} height={LOGO_SIZE_INTRO} viewBox="0 0 100 100">

              <Path
                d="M 30,88 L 13,88 L 13,22 Q 13,13 22,13 L 88,13"
                fill="none"
                stroke={FRAME_COLOR}
                strokeWidth={SW}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

              <Rect
                x="25.5"
                y="25.5"
                width="9"
                height="9"
                rx="1.5"
                ry="1.5"
                fill={MARKER_COLOR}
              />

              <Path
                d="M 48,34 L 48,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={SW + 2}
                strokeLinecap="round"
              />

              <Path
                d="M 48,34 C 72,34 72,86 48,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={SW + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </Svg>
          </View>

          {/* Text content continues unchanged */}

          <Animated.Text style={[styles.brandName, { opacity: brandOpacity }]}>
            Dometrik
          </Animated.Text>

          <Animated.Text style={[styles.subtitleText, { opacity: subtitleOpacity }]}>
            Construction Cost Estimator
          </Animated.Text>

          <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>
              Understand the real cost before you build.
            </Text>
            <View style={styles.taglineLine} />
          </Animated.View>

        </ScrollView>

      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({

container:{
position:'absolute',
top:0,left:0,right:0,bottom:0,
zIndex:9999,
elevation:9999
},

splashScreen:{
...StyleSheet.absoluteFillObject,
backgroundColor:Colors.splash,
zIndex:2
},

splashCenter:{
flex:1,
alignItems:'center',
justifyContent:'center'
},

svgLayer:{
position:'absolute',
top:0,
left:0
},

introScreen:{
...StyleSheet.absoluteFillObject,
backgroundColor:Colors.background,
zIndex:1,
paddingHorizontal:24
},

scrollContent:{
flexGrow:1,
alignItems:'center',
justifyContent:'center',
paddingBottom:20
},

introLogoWrap:{
width:LOGO_SIZE_INTRO,
height:LOGO_SIZE_INTRO,
alignItems:'center',
justifyContent:'center'
},

brandName:{
fontSize:34,
fontWeight:'700',
color:Colors.text,
textAlign:'center',
letterSpacing:0.6
},

subtitleText:{
fontSize:15,
fontWeight:'500',
color:Colors.textSecondary,
textAlign:'center'
},

taglineWrap:{
flexDirection:'row',
alignItems:'center',
gap:10
},

taglineLine:{
height:1,
width:18,
backgroundColor:Colors.border
},

taglineText:{
fontSize:13,
fontWeight:'600',
color:Colors.accent,
fontStyle:'italic',
textAlign:'center'
}

});