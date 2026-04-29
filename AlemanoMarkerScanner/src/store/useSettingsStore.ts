import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {AppSettings, CameraResolution, FlashMode} from '../types';

interface SettingsState extends AppSettings {
  setResolution: (resolution: CameraResolution) => void;
  setFlash: (flash: FlashMode) => void;
  setAutoCapture: (autoCapture: boolean) => void;
  setVibration: (vibration: boolean) => void;
}

const defaultSettings: AppSettings = {
  resolution: 3000,
  flash: 'auto',
  autoCapture: true,
  vibration: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...defaultSettings,
      setResolution: resolution => set({resolution}),
      setFlash: flash => set({flash}),
      setAutoCapture: autoCapture => set({autoCapture}),
      setVibration: vibration => set({vibration}),
    }),
    {
      name: 'alemeno-marker-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
