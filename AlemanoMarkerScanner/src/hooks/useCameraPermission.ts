import {useCallback, useEffect, useState} from 'react';
import {Camera} from 'react-native-vision-camera';

export function useCameraPermission() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPermission = useCallback(async () => {
    const status = await Camera.getCameraPermissionStatus();
    setHasPermission(status === 'granted');
    setIsLoading(false);
    return status;
  }, []);

  useEffect(() => {
    refreshPermission().catch(() => undefined);
  }, [refreshPermission]);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'granted');
    setIsLoading(false);
    return status === 'granted';
  }, []);

  return {
    hasPermission,
    isLoading,
    refreshPermission,
    requestPermission,
  };
}
