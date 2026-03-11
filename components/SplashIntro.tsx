
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

const AnimatedPath = Animated.createAnimatedComponent(Path);

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

  const frameProgress = useRef(new Animated.Value(220)).current;
  const dProgress = useRef(new Animated.Value(120)).current;

  const markerOpacity = useRef(new Animated.Value(0)).current;

  const splashFade = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;

  const introFadeIn = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const bulletAnims = useRef(BULLETS.map(() => new Animated.Value(0))).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;

  const SW = 8;
  const D_SW = 8;

  const showIntroContent = useCallback(() => {

    Animated.sequence([
      Animated.timing(brandOpacity,{toValue:1,duration:250,useNativeDriver:true}),
      Animated.timing(subtitleOpacity,{toValue:1,duration:200,useNativeDriver:true}),
      Animated.timing(taglineOpacity,{toValue:1,duration:200,useNativeDriver:true}),
      Animated.stagger(
        60,
        bulletAnims.map(anim =>
          Animated.timing(anim,{toValue:1,duration:180,useNativeDriver:true})
        )
      ),
      Animated.parallel([
        Animated.timing(buttonOpacity,{toValue:1,duration:250,useNativeDriver:true}),
        Animated.timing(buttonSlide,{toValue:0,duration:250,useNativeDriver:true}),
      ])
    ]).start();

  },[]);

  const startTransition = useCallback(()=>{

    onSplashDone();

    Animated.parallel([
      Animated.timing(splashFade,{
        toValue:0,
        duration:400,
        useNativeDriver:true
      }),
      Animated.timing(splashScale,{
        toValue:0.82,
        duration:400,
        useNativeDriver:true
      }),
      Animated.timing(introFadeIn,{
        toValue:1,
        duration:450,
        useNativeDriver:true
      })
    ]).start(()=>{
      setPhase('intro');
      showIntroContent();
    });

    setPhase('transition');

  },[]);

  useEffect(()=>{

    Animated.sequence([

      Animated.timing(frameProgress,{
        toValue:0,
        duration:700,
        useNativeDriver:true
      }),

      Animated.timing(markerOpacity,{
        toValue:1,
        duration:200,
        useNativeDriver:true
      }),

      Animated.timing(dProgress,{
        toValue:0,
        duration:500,
        useNativeDriver:true
      })

    ]).start(()=>{

      setTimeout(()=>{
        startTransition();
      },200);

    });

  },[]);

  const renderSplashLogo = () => (

    <Animated.View
      style={{
        width:LOGO_SIZE_SPLASH,
        height:LOGO_SIZE_SPLASH,
        transform:[{scale:splashScale}],
        opacity:splashFade
      }}
    >

      <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">

        <AnimatedPath
          d="M 31,87 L 14,87 L 14,23 Q 14,14 23,14 L 87,14"
          fill="none"
          stroke={SPLASH_COLOR_WHITE}
          strokeWidth={SW}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray="220"
          strokeDashoffset={frameProgress}
        />

        <Animated.View
  style={{
    position: "absolute",
    opacity: markerOpacity
  }}
>
  <Svg width={LOGO_SIZE_SPLASH} height={LOGO_SIZE_SPLASH} viewBox="0 0 100 100">
    <Rect
      x="25.5"
      y="25.5"
      width="9"
      height="9"
      rx="1.2"
      fill={Colors.accent}
    />
  </Svg>
</Animated.View>

        <AnimatedPath
          d="M 54,34 L 54,86"
          fill="none"
          stroke={SPLASH_COLOR_WHITE}
          strokeWidth={D_SW}
          strokeLinecap="square"
          strokeDasharray="120"
          strokeDashoffset={dProgress}
        />

        <AnimatedPath
          d="M 54,34 C 74,34 74,86 54,86"
          fill="none"
          stroke={SPLASH_COLOR_WHITE}
          strokeWidth={D_SW}
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeDasharray="120"
          strokeDashoffset={dProgress}
        />

      </Svg>

    </Animated.View>

  );

  return (

    <View style={styles.container}>

      <View style={styles.splashScreen}>
        <View style={styles.splashCenter}>
          {renderSplashLogo()}
        </View>
      </View>

      <Animated.View
        style={[
          styles.introScreen,
          {
            opacity:introFadeIn,
            paddingTop:insets.top + 48,
            paddingBottom:insets.bottom + 24
          }
        ]}
        pointerEvents={phase !== 'splash' ? 'auto' : 'none'}
      >

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          <View style={styles.introLogoWrap}>

            <Svg width={LOGO_SIZE_INTRO} height={LOGO_SIZE_INTRO} viewBox="0 0 100 100">

              <Path
                d="M 31,87 L 14,87 L 14,23 Q 14,14 23,14 L 87,14"
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
                rx="1.2"
                fill={MARKER_COLOR}
              />

              <Path
                d="M 54,34 L 54,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={D_SW}
                strokeLinecap="square"
              />

              <Path
                d="M 54,34 C 74,34 74,86 54,86"
                fill="none"
                stroke={D_COLOR}
                strokeWidth={D_SW}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

            </Svg>

          </View>

          <View style={styles.spacer20}/>

          <Animated.Text style={[styles.brandName,{opacity:brandOpacity}]}>
            Dometrik
          </Animated.Text>

          <View style={styles.spacer8}/>

          <Animated.Text style={[styles.subtitleText,{opacity:subtitleOpacity}]}>
            Construction Cost Estimator
          </Animated.Text>

          <View style={styles.spacer18}/>

          <Animated.View style={[styles.taglineWrap,{opacity:taglineOpacity}]}>
            <View style={styles.taglineLine}/>
            <Text style={styles.taglineText}>
              Understand the real cost before you build.
            </Text>
            <View style={styles.taglineLine}/>
          </Animated.View>

          <View style={styles.spacer24}/>

          <View style={styles.bulletsWrap}>

            {BULLETS.map((bullet,index)=>(
              <Animated.View
                key={index}
                style={[styles.bulletRow,{opacity:bulletAnims[index]}]}
              >
                <View style={styles.bulletDot}/>
                <Text style={styles.bulletText}>{bullet}</Text>
              </Animated.View>
            ))}

          </View>

          <View style={styles.spacer32}/>

          <Animated.View
            style={[
              styles.buttonWrap,
              {
                opacity:buttonOpacity,
                transform:[{translateY:buttonSlide}]
              }
            ]}
          >

            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={onStart}
            >
              <Text style={styles.startButtonText}>
                Start Estimate
              </Text>
            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

      </Animated.View>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
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

  spacer8:{height:8},
  spacer18:{height:18},
  spacer20:{height:20},
  spacer24:{height:24},
  spacer32:{height:32},

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
    textAlign:'center',
    letterSpacing:0.2
  },

  taglineWrap:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
    paddingHorizontal:8
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
    letterSpacing:0.2,
    textAlign:'center',
    flexShrink:1
  },

  bulletsWrap:{
    alignSelf:'stretch',
    gap:12,
    paddingHorizontal:8
  },

  bulletRow:{
    flexDirection:'row',
    alignItems:'center'
  },

  bulletDot:{
    width:6,
    height:6,
    borderRadius:3,
    backgroundColor:Colors.accent,
    marginRight:12
  },

  bulletText:{
    fontSize:14,
    fontWeight:'500',
    color:Colors.text,
    flex:1,
    lineHeight:22
  },

  buttonWrap:{
    alignSelf:'stretch',
    paddingHorizontal:8
  },

  startButton:{
    backgroundColor:Colors.accent,
    borderRadius:14,
    paddingVertical:16,
    alignItems:'center',
    ...Platform.select({
      ios:{
        shadowColor:Colors.accent,
        shadowOffset:{width:0,height:6},
        shadowOpacity:0.25,
        shadowRadius:12
      },
      android:{elevation:6},
      web:{
        shadowColor:Colors.accent,
        shadowOffset:{width:0,height:6},
        shadowOpacity:0.25,
        shadowRadius:12
      }
    })
  },

  startButtonText:{
    fontSize:17,
    fontWeight:'700',
    color:'#FFFFFF',
    letterSpacing:0.3
  }

});

