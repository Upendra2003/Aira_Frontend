import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/utils/apiConfig'; 
import{ useAuthStore } from '@/utils/authStore'; // Ensure this path is correct
import { Buffer } from 'buffer';
import Waveform from '../Waveform';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
 


export default function Voicechat  () {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sound, setSound] = useState(null);
  const{token} = useAuthStore();
  const scale = useRef(new Animated.Value(1)).current;
const [isPlaying, setIsPlaying] = useState(false);

  const rotation = useRef(new Animated.Value(0)).current;

  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  
  
  const stopPulsing = () => {
    scale.stopAnimation();
    scale.setValue(1);
  };

  // Animation control
  useEffect(() => {
    if (isFetching) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation();
      rotation.setValue(0);
    }
  }, [isFetching, rotation]);



  // Start recording
  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop recording and send to API
  const stopRecording = async () => {
    console.log('Stopping recording..');
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stored at', uri);

    setRecording(null);
    await sendRecording(uri);
  };

  // Send recorded file to API
  const sendRecording = async (uri) => {
    try {
      setIsFetching(true);

      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/x-m4a',
      });

      const response = await fetch(`${API_URL}/speech/respond`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // ✅ Add your token here
        },
      });
      

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        await saveAndPlayAudio(arrayBuffer);
      } else {
        console.error('API Error');
        Alert.alert('Error', 'Failed to process audio');
      }
    } catch (error) {
      console.error('Error sending recording:', error);
    } finally {
      setIsFetching(false);
    }
  };

 // Save audio to local file and play
const saveAndPlayAudio = async (arrayBuffer) => {
  try {
    const fileUri = FileSystem.cacheDirectory + 'response.wav';

    // Write binary data to file
    await FileSystem.writeAsStringAsync(
      fileUri,
      Buffer.from(arrayBuffer).toString('base64'),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    console.log('Audio file saved at', fileUri);

    // Load the sound from the file
    const { sound: newSound } = await Audio.Sound.createAsync({ uri: fileUri });

    setSound(newSound);
    setIsPlaying(true);
    startPulsing();

    // Listen for playback finish
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        stopPulsing();
      }
    });

    await newSound.playAsync();
  } catch (error) {
    console.error('Error playing audio', error);
    setIsPlaying(false);
    stopPulsing();
  }
};
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isRecording ? '🎙️ Recording...' : isPlaying ? '🎧 Playing...' : isFetching ? '⚙️ Processing...' : 'Press and Hold to Speak'}
        </Text>
      </View>

      {isFetching ? (
        <Animated.View style={[styles.pulsingContainer, { transform: [{ scale: isPlaying ? scale : 1 }] }]}>
          <Ionicons name="mic" size={80} color="#34C759" />
        </Animated.View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.recordButton, isRecording && { backgroundColor: '#FF3B30' }]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <Ionicons name="mic" size={60} color="#fff" />
        </TouchableOpacity>
      )}
      <Waveform isPlaying={isPlaying} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusContainer: {
    marginBottom: 50,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
  },
  statusText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  pulsingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

