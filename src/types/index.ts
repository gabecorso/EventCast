/**
 * Comprehensive type definitions for the EventCast
 * Defines all data structures, API interfaces, and component prop types
 */

// Weather data types
export interface Temperature {
    max: number;
    min: number;
    average: number;
  }
  
  export interface Precipitation {
    probability: number;
    amount: number;
  }
  
  export interface Wind {
    speed: number;
    gust: number | null;
  }
  
  export interface HourlyData {
    time: string;
    hour: number;
    temperature: number;
    precipProbability: number;
    windSpeed: number;
    conditions: string;
    icon: string;
  }
  
  export interface SuitabilityFactor {
    type: 'cold' | 'hot' | 'temperature' | 'rain' | 'wind' | 'humidity' | 'dry' | 'sunny' | 'calm';
    impact: 'positive' | 'negative';
  }
  
  export interface SuitabilityScore {
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    factors: SuitabilityFactor[];
  }
  
  export interface DayWeather {
    date: string;
    dayOfWeek: number;
    conditions: string;
    icon: string;
    description: string;
    temperatures: Temperature;
    precipitation: Precipitation;
    wind: Wind;
    humidity: number;
    hourlyData: HourlyData[];
    suitabilityScore: SuitabilityScore;
    hasDetailedForecast: boolean;
  }
  
  export interface WeatherData {
    location: string;
    timezone: string;
    currentWeek: DayWeather[];
    nextWeek: DayWeather[];
    lastUpdated: string;
  }
  
  // Configuration types
  export interface TimeRange {
    label: string;
    start: number;
    end: number;
  }
  
  export interface WeatherThresholds {
    temperature: {
      min: number;
      max: number;
    };
    precipitation: {
      max: number;
    };
    windSpeed: {
      max: number;
    };
    humidity: {
      min: number;
      max: number;
    };
  }
  
  export interface Config {
    VISUAL_CROSSING_API_KEY: string;
    API_BASE_URL: string;
    DEFAULT_LOCATION: string;
    DEFAULT_DAY: number;
    DEFAULT_TIME_RANGES: TimeRange[];
    WEATHER_THRESHOLDS: WeatherThresholds;
  }
  
  // Context types
  export interface WeatherContextType {
    weatherData: WeatherData | null;
    location: string;
    selectedDay: number;
    selectedTimeRange: TimeRange;
    loading: boolean;
    error: string | null;
    handleLocationChange: (location: string) => void;
    handleDayChange: (day: number) => void;
    handleTimeRangeChange: (timeRange: TimeRange) => void;
    refreshWeatherData: () => void;
  }
  
  // Component prop types
  export interface WeekViewProps {
    weekData: DayWeather[];
    weekType: 'current' | 'next';
    selectedDay: number;
    selectedTimeRange: TimeRange;
    expandedDay: string | null;
    onDayExpand: (weekType: string, dayIndex: number) => void;
  }
  
  export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
  }
  
  // API types
  export interface VisualCrossingAPIResponse {
    latitude: number;
    longitude: number;
    resolvedAddress: string;
    timezone: string;
    tzoffset: number;
    days: VisualCrossingDay[];
  }
  
  export interface VisualCrossingDay {
    datetime: string;
    datetimeEpoch: number;
    tempmax: number;
    tempmin: number;
    temp: number;
    humidity: number;
    precip: number;
    precipprob: number;
    windspeed: number;
    windgust?: number;
    conditions: string;
    description: string;
    icon: string;
    hours: VisualCrossingHour[];
  }
  
  export interface VisualCrossingHour {
    datetime: string;
    datetimeEpoch: number;
    temp: number;
    humidity: number;
    precip: number;
    precipprob: number;
    windspeed: number;
    conditions: string;
    icon: string;
  }
  
  // Utility types
  export type WeatherCategory = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'default';
  
  export interface TimeRangeAverages {
    temperature: number;
    precipProbability: number;
    windSpeed: number;
    hourCount: number;
  }
  
  // Recommendation types
  export interface WeatherRecommendation {
    type: 'excellent' | 'good' | 'poor' | 'recommendation' | 'neutral';
    title: string;
    message: string;
    icon: string;
  }