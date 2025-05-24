import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import config from './config/config';
import { WeatherProvider } from './context/WeatherContext';
import { WeatherContextType, WeatherData, TimeRange } from './types';

function App() {

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(config.DEFAULT_LOCATION);
  const [selectedDay, setSelectedDay] = useState<number>(config.DEFAULT_DAY);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(config.DEFAULT_TIME_RANGES[1]); // Afternoon by default


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
