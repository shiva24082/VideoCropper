import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PreviewScreen() {
  const { startTime, endTime } = useLocalSearchParams<{
    startTime: string;
    endTime: string;
  }>();
  
  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const start = parseFloat(startTime || '0');
  const end = parseFloat(endTime || '10');

  useEffect(() => {
    videoRef.current?.setPositionAsync(start * 1000);
  }, []);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setIsLoading(false);
      if (playbackStatus.positionMillis >= end * 1000) {
        videoRef.current?.setPositionAsync(start * 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isLoading && (
          <ActivityIndicator style={styles.loader} size="large" color="#1E90FF" />
        )}
        <Video
          ref={videoRef}
          style={styles.video}
          source={require('../../assets/videos/sample.mp4')}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onLoadStart={() => setIsLoading(true)}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Playing from {formatTime(start)} to {formatTime(end)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  videoContainer: {
    height: width * 0.6,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
});