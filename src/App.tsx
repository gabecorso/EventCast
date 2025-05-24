import React, { useCallback, useEffect, useState } from 'react';
import './styles/App.scss';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import config from './config/config';
import { WeatherProvider } from './context/WeatherContext';
import { WeatherContextType, WeatherData, TimeRange } from './types';
import weatherService from './services/weatherService';
import Header from './components/Header';
import WeatherComparison from './components/WeatherComparison';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fad } from '@fortawesome/pro-duotone-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

// Initialize Font Awesome library
library.add(fad, fas, far);

function App() {

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(config.DEFAULT_LOCATION);
  const [selectedDay, setSelectedDay] = useState<number>(config.DEFAULT_DAY);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(config.DEFAULT_TIME_RANGES[1]); // Afternoon by default


  const fetchWeatherData = useCallback(async (searchLocation: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const data: WeatherData = await weatherService.getWeatherForecast(searchLocation);
      setWeatherData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData(location);
  }, [location, fetchWeatherData]);

  const handleLocationChange = useCallback((newLocation: string): void => {
    setLocation(newLocation);
  }, []);

  const handleDayChange = useCallback((newDay: number): void => {
    setSelectedDay(newDay);
  }, []);

  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange): void => {
    setSelectedTimeRange(newTimeRange);
  }, []);

  const refreshWeatherData = useCallback((): void => {
    fetchWeatherData(location);
  }, [location, fetchWeatherData]);

  const weatherContextValue: WeatherContextType = {
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
        <Header />
        <main className="main-content">
            {loading && <LoadingState />}
            
            {error && (
              <div className="error-message">
                <p>Unable to load weather data: {error}</p>
                <button 
                  onClick={refreshWeatherData}
                  className="button button-primary"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {!loading && !error && weatherData && (
              <>
                <WeatherComparison />
                {/* <DecisionHelper /> */}
              </>
            )}
          </main>
      </WeatherProvider>
      <LoadingState />
    </ErrorBoundary>
  );
}

export default App;
