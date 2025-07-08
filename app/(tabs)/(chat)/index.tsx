import { View, Text, TouchableOpacity, StyleSheet,Image,ImageSourcePropType} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { initializeNotifications } from '../../../utils/lib'
import React, { useState,useEffect } from 'react';
import { useStreakStore } from '@/utils/streakStore'; // Adjust path
import Animated, {
  FadeIn,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleGoodEveningNotification} from '../../../utils/lib/noti';

initializeNotifications();
scheduleGoodEveningNotification();
const gap = 10;

interface HeadTextProps {
  text?: string;
  side?: 'left' | 'right';
  size?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold' | '700';
  image?: ImageSourcePropType;
}

const HeadText = (props: HeadTextProps) => {
  const { text, side, image,size,color,fontWeight } = props;
  const [totalWidth, setTotalWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const width = totalWidth - textWidth - gap;

  const Transition = LinearTransition.delay(1650).springify().damping(18).stiffness(50);
  const LeftSlide = SlideInLeft.delay(1500).springify().damping(18).stiffness(50);
  const RightSlide = SlideInRight.delay(1500).springify().damping(18).stiffness(50);

  return (
    <Animated.View
      entering={FadeIn.delay(1000).springify().damping(18).stiffness(50)}
      layout={Transition}
      onLayout={(event) => {
        setTotalWidth(event.nativeEvent.layout.width);
      }}
      style={styles.headerContainer}>
      {Boolean(width > 0) && side === 'left' && (
        <Animated.View entering={LeftSlide} style={[styles.embedImage, { width }]}>
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
      {Boolean(text) && (
        <Animated.Text
          layout={Transition}
          onLayout={(event) => {
            setTextWidth(event.nativeEvent.layout.width);
          }}
          style={{
            fontSize: size ,
            fontWeight: fontWeight||'700',
            color: color||'#0C1824',
          }}>
          {text}
        </Animated.Text>
      )}
      {Boolean(width > 0) && side === 'right' && (
        <Animated.View entering={RightSlide} style={[styles.embedImage, { width }]}>
          <Image source={image} style={styles.image} />
        </Animated.View>
      )}
    </Animated.View>
  );
};




export default function Index() {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation(); 
  const { updateStreak, lastOpenedDate } = useStreakStore();

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastOpenedDate !== today) {
      updateStreak(); // Only update if new day
    }
  }, []);

  // Uncomment the following lines to schedule a notification
  // const[title,setTitle] = useState('');
  // const[body,setBody] = useState('');
  // const scheduleNotification = () => {
  //   console.log('Scheduling notification with title:', title, 'and body:', body); 
  //   Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: title,
  //       body: body,
  //     },
  //     trigger: {
  //       type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  //       seconds:10,
  //     },
  //   });
    
  
  // }

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <HeadText text="Welcome to" side="left" size={50} image={require('../../../assets/images/one.jpg')} />
      <HeadText text="Aira Chat" side="right"size={50} image={require('../../../assets/images/two.png')} />
      <HeadText text="Click" side="left" size={50} image={require('../../../assets/images/five.png')} />
  
      <TouchableOpacity style={styles.button} onPress={() => router.push('GiftChat')}>
      <HeadText text="to begin ✨" color='#fff' size={50} /> 
      </TouchableOpacity>
      
      <HeadText side="right" image={require('../../../assets/images/four.png')} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
  },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    justifyContent: 'center',
    gap: gap,
    height: 80,
  },
  embedImage: {
    height: 80,
    borderRadius: 22,
    overflow: 'hidden',
  },
  headText: {
    fontSize: 50,
    fontWeight: '700',
    color: '#0C1824',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode:'cover',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
