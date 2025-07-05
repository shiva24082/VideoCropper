
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Add this type declaration
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "(crop)": undefined;
      "(preview)": {
        startTime: string;
        endTime: string;
      };
    }
  }
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}