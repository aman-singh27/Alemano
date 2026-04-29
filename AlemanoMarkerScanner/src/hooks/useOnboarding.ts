import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';

const ONBOARDING_KEY = 'alemeno-has-completed-onboarding';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(value => {
        setHasCompletedOnboarding(value === 'true');
      })
      .catch(() => {
        setHasCompletedOnboarding(false);
      });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    isReady: hasCompletedOnboarding != null,
  };
}
