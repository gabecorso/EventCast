import React from 'react';
import logo from './logo.svg';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import { WeatherProvider } from './context/WeatherContext';
import { WeatherContextType } from './types';

function App() {

  const contextValue: WeatherContextType = {
    weatherData,
    location,
    selectedDay,
    selectedTimeRange,
    loading,
    error,
    handleLocationChange,
    handleDayChange,
    handleTimeRangeChange,
    refreshWeatherData
  };
  
  return (
    <ErrorBoundary>
      <WeatherProvider value={weatherContextValue}>
        
      </WeatherProvider>
      <LoadingState />
    </ErrorBoundary>
  );
}

export default App;
