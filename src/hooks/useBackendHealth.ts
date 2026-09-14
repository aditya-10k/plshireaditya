import { useState, useEffect, useCallback } from 'react';
import { healthService, HealthState } from '../services/healthService';

export function useBackendHealth() {
  const [state, setState] = useState<HealthState>(healthService.getState());

  useEffect(() => {
    const unsubscribe = healthService.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  const refresh = useCallback(() => {
    return healthService.checkHealth();
  }, []);

  return {
    ...state,
    refresh,
  };
}
