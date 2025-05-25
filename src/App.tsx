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
import DecisionHelper from './components/DecisionHelper';
import { startOfDay, addDays, isAfter, getTime } from 'date-fns';
import { getTimeOfDayClass } from './utils/helpers';

// Initialize Font Awesome library
library.add(fad, fas, far);

function App() {

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [navigationLoading, setNavigationLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(config.DEFAULT_LOCATION);
  const [selectedDay, setSelectedDay] = useState<number>(config.DEFAULT_DAY);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(config.DEFAULT_TIME_RANGES[1]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfDay(new Date()));
  const [timeOfDayClass, setTimeOfDayClass] = useState(getTimeOfDayClass());


  const fetchWeatherData = useCallback(async (
    searchLocation: string, 
    weekStart: Date,
    isNavigation: boolean = false
  ): Promise<void> => {
    if (isNavigation) {
      setNavigationLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data: WeatherData = await weatherService.getWeatherForecast(
        searchLocation,
        weekStart,
        28 // Always fetch 4 weeks for comparison
      );
      setWeatherData(data);
      setCurrentWeekStart(weekStart);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setNavigationLoading(false);
    }
  }, []);

  //handle theme to time of day
  useEffect(() => {
    const updateTimeClass = () => {
      setTimeOfDayClass(getTimeOfDayClass());
    };
  
    const interval = setInterval(updateTimeClass, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchWeatherData(location, currentWeekStart, false);
  }, [location]); // Only refetch on location change, not weekStart

  const handleLocationChange = useCallback((newLocation: string): void => {
    setLocation(newLocation);
    // Reset to current week when location changes
    setCurrentWeekStart(startOfDay(new Date()));
  }, []);

  const handleDayChange = useCallback((newDay: number): void => {
    setSelectedDay(newDay);
  }, []);

  const handleTimeRangeChange = useCallback((newTimeRange: TimeRange): void => {
    setSelectedTimeRange(newTimeRange);
  }, []);

  const refreshWeatherData = useCallback((): void => {
    weatherService.clearLocationCache(location);
    fetchWeatherData(location, currentWeekStart, false);
  }, [location, currentWeekStart, fetchWeatherData]);

  const navigateWeeks = useCallback((direction: 'forward' | 'backward'): void => {
    const newStart = direction === 'forward' 
      ? addDays(currentWeekStart, 14)
      : addDays(currentWeekStart, -14);
    
    // Prevent navigating before today
    const today = startOfDay(new Date());
    if (!isAfter(newStart, today) && direction === 'backward') {
      const adjustedStart = today;
      if (adjustedStart.getTime() !== currentWeekStart.getTime()) {
        fetchWeatherData(location, adjustedStart, true);
      }
    } else {
      fetchWeatherData(location, newStart, true);
    }
  }, [currentWeekStart, location, fetchWeatherData]);

  const canNavigateBackward = useCallback((): boolean => {
    const today = startOfDay(new Date());
    const twoWeeksBack = addDays(currentWeekStart, -14);
    return isAfter(twoWeeksBack, today) || 
           twoWeeksBack.getTime() === today.getTime();
  }, [currentWeekStart]);

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
    <div className={`app-container ${timeOfDayClass}`}>
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
                 <WeatherComparison 
                  currentWeekStart={currentWeekStart}
                  onNavigate={navigateWeeks}
                  canNavigateBackward={canNavigateBackward()}
                  isNavigating={navigationLoading}
                />
                <DecisionHelper />
              </>
            )}
          </main>
      </WeatherProvider>
    </ErrorBoundary>
    </div>
  );
}

export default App;
