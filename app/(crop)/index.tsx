import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, AVPlaybackStatus, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

type LoadedStatus = {
  isLoaded: true;
  durationMillis: number;
  positionMillis: number;
};

export default function CropScreen() {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<LoadedStatus | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (playbackStatus.isLoaded) {
      setStatus({
        isLoaded: true,
        durationMillis: playbackStatus.durationMillis || 0,
        positionMillis: playbackStatus.positionMillis || 0,
      });
      setIsLoading(false);
      
      if (playbackStatus.positionMillis >= endTime * 1000) {
        videoRef.current?.setPositionAsync(startTime * 1000);
      }
    } else {
      setStatus(null);
    }
  };

  const navigateToPreview = () => {
    if (!status) return;
    
    router.navigate({
      pathname: "/(preview)",
      params: {
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSafeDuration = () => {
    return status?.durationMillis ? status.durationMillis / 1000 : 100;
  };

  const getSafePosition = () => {
    return status?.positionMillis ? status.positionMillis / 1000 : 0;
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
          onReadyForDisplay={() => setIsLoading(false)}
        />
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.timeText}>
          Current: {formatTime(getSafePosition())} / Total: {formatTime(getSafeDuration())}
        </Text>
        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={getSafeDuration()}
          value={getSafePosition()}
          onSlidingComplete={async (value) => {
            await videoRef.current?.setPositionAsync(value * 1000);
          }}
          minimumTrackTintColor="#1E90FF"
          maximumTrackTintColor="#CCCCCC"
          thumbTintColor="#1E90FF"
        />

        <View style={styles.trimContainer}>
          <Text style={styles.sectionTitle}>Select Crop Range</Text>
          
          <View style={styles.rangeRow}>
            <Text style={styles.timeLabel}>Start: {formatTime(startTime)}</Text>
            <Slider
              style={styles.rangeSlider}
              minimumValue={0}
              maximumValue={getSafeDuration()}
              value={startTime}
              onValueChange={setStartTime}
              minimumTrackTintColor="#FF5722"
              maximumTrackTintColor="#FFCCBC"
              thumbTintColor="#FF5722"
            />
          </View>

          <View style={styles.rangeRow}>
            <Text style={styles.timeLabel}>End: {formatTime(endTime)}</Text>
            <Slider
              style={styles.rangeSlider}
              minimumValue={0}
              maximumValue={getSafeDuration()}
              value={endTime}
              onValueChange={setEndTime}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#C8E6C9"
              thumbTintColor="#4CAF50"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.button,
            !status && styles.disabledButton
          ]} 
          onPress={navigateToPreview}
          disabled={!status}
        >
          <Text style={styles.buttonText}>Preview Cropped Video</Text>
        </TouchableOpacity>
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
  controlsContainer: {
    flex: 1,
  },
  timeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 24,
  },
  trimContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    width: 80,
    fontSize: 14,
    color: '#555',
  },
  rangeSlider: {
    flex: 1,
    height: 30,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});