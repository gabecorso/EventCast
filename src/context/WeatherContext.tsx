import React, { createContext, useContext, ReactNode } from 'react';
import { WeatherContextType } from '../types';

/**
 * Weather context implementation with TypeScript type safety
 * Provides global state management for weather data and application controls
 */
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

/**
 * Custom hook for accessing weather context with type safety
 * Ensures context is used within provider boundaries
 * @returns WeatherContextType - Typed context value
 * @throws Error if used outside of WeatherProvider
 */
export const useWeather = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
  children: ReactNode;
  value: WeatherContextType;
}

/**
 * Provider component that supplies weather context to child components
 * Wraps application tree to enable global state access
 * @param children - React components that require weather context access
 * @param value - Weather context value containing state and handlers
 */
export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children, value }) => {
  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};

export default WeatherContext;