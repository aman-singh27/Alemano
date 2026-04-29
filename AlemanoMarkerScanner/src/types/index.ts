export interface MarkerCapture {
  id: string;
  uri: string;
  capturedAt: string;
  orientation: number;
  fileSize: number;
  frameIndex: number;
  width: 300;
  height: 300;
}

export type CameraResolution = 2000 | 2500 | 3000;

export type FlashMode = 'auto' | 'on' | 'off';

export interface AppSettings {
  resolution: CameraResolution;
  flash: FlashMode;
  autoCapture: boolean;
  vibration: boolean;
}
