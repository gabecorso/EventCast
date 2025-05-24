import axios, { AxiosError, AxiosResponse } from 'axios';
import { addDays, format, startOfDay } from 'date-fns';
import config from '../config/config';
import { 
  WeatherData, 
  DayWeather, 
  HourlyData, 
  SuitabilityScore,
  SuitabilityFactor,
  VisualCrossingAPIResponse,
  VisualCrossingDay,
  VisualCrossingHour 
} from '../types';

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

/**
 * WeatherService class implementing comprehensive weather data management
 * Provides type-safe API interactions with caching and error handling
 * Transforms raw API responses into application-specific data structures
 */
class WeatherService {
  private cache: Map<string, CacheEntry>;
  private readonly cacheTimeout: number;

  constructor() {
    this.cache = new Map<string, CacheEntry>();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache duration
  }

  /**
   * Fetch weather forecast for specified location with TypeScript type safety
   * Implements caching strategy to optimize API usage
   * @param location - Location string (city, state, or coordinates)
   * @returns Promise resolving to transformed weather data
   * @throws Error with user-friendly message on API failure
   */
  public async getWeatherForecast(location: string): Promise<WeatherData> {
    const cacheKey = this.generateCacheKey(location);
    const cachedData = this.getCachedData(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const today = startOfDay(new Date());
      const endDate = addDays(today, 14);
      
      const response: AxiosResponse<VisualCrossingAPIResponse> = await axios.get(
        `${config.API_BASE_URL}/${encodeURIComponent(location)}/${format(today, 'yyyy-MM-dd')}/${format(endDate, 'yyyy-MM-dd')}`,
        {
          params: {
            key: config.VISUAL_CROSSING_API_KEY,
            unitGroup: 'us',
            include: 'days,hours',
            elements: 'datetime,tempmax,tempmin,temp,humidity,precip,precipprob,windspeed,windgust,conditions,icon,description'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const transformedData = this.transformWeatherData(response.data);
      this.setCachedData(cacheKey, transformedData);
      
      return transformedData;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Transform Visual Crossing API response to application data structure
   * Implements comprehensive data mapping with type safety
   * @param apiData - Raw API response from Visual Crossing
   * @returns Transformed weather data conforming to application types
   */
  private transformWeatherData(apiData: VisualCrossingAPIResponse): WeatherData {
    const { days, resolvedAddress, timezone } = apiData;
    
    // Split data into current week and next week with proper typing
    const currentWeek = days.slice(0, 7);
    const nextWeek = days.slice(7, 14);

    return {
      location: resolvedAddress,
      timezone,
      currentWeek: this.processWeekData(currentWeek),
      nextWeek: this.processWeekData(nextWeek),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Process weekly weather data with enhanced type safety
   * Calculates suitability scores and transforms hourly data
   * @param weekDays - Array of daily weather data from API
   * @returns Processed array of DayWeather objects
   */
  private processWeekData(weekDays: VisualCrossingDay[]): DayWeather[] {
    return weekDays.map(day => ({
      date: day.datetime,
      dayOfWeek: new Date(day.datetime).getDay(),
      conditions: day.conditions,
      icon: this.mapWeatherIcon(day.icon),
      description: day.description,
      temperatures: {
        max: Math.round(day.tempmax),
        min: Math.round(day.tempmin),
        average: Math.round(day.temp)
      },
      precipitation: {
        probability: day.precipprob,
        amount: day.precip
      },
      wind: {
        speed: Math.round(day.windspeed),
        gust: day.windgust ? Math.round(day.windgust) : null
      },
      humidity: day.humidity,
      hourlyData: this.processHourlyData(day.hours),
      suitabilityScore: this.calculateSuitabilityScore(day)
    }));
  }

  /**
   * Process hourly weather data with proper type transformations
   * @param hours - Array of hourly data from API
   * @returns Typed array of HourlyData objects
   */
  private processHourlyData(hours: VisualCrossingHour[]): HourlyData[] {
    return hours.map(hour => ({
      time: hour.datetime,
      hour: new Date(`1970-01-01T${hour.datetime}`).getHours(),
      temperature: Math.round(hour.temp),
      precipProbability: hour.precipprob,
      windSpeed: Math.round(hour.windspeed),
      conditions: hour.conditions,
      icon: this.mapWeatherIcon(hour.icon)
    }));
  }

  /**
   * Calculate comprehensive weather suitability score for outdoor activities
   * Implements multi-factor analysis with configurable thresholds
   * @param dayData - Daily weather data from API
   * @returns Typed suitability score with rating and factors
   */
  private calculateSuitabilityScore(dayData: VisualCrossingDay): SuitabilityScore {
    const { WEATHER_THRESHOLDS } = config;
    let score = 100;
    const factors: SuitabilityFactor[] = [];

    // Temperature evaluation with type-safe factor creation
    if (dayData.tempmax < WEATHER_THRESHOLDS.temperature.min) {
      score -= 20;
      factors.push({ type: 'cold', impact: 'negative' });
    } else if (dayData.tempmax > WEATHER_THRESHOLDS.temperature.max) {
      score -= 15;
      factors.push({ type: 'hot', impact: 'negative' });
    } else {
      factors.push({ type: 'temperature', impact: 'positive' });
    }

    // Precipitation evaluation
    if (dayData.precipprob > WEATHER_THRESHOLDS.precipitation.max) {
      score -= 30;
      factors.push({ type: 'rain', impact: 'negative' });
    }

    // Wind evaluation
    if (dayData.windspeed > WEATHER_THRESHOLDS.windSpeed.max) {
      score -= 20;
      factors.push({ type: 'wind', impact: 'negative' });
    }

    // Humidity evaluation
    if (dayData.humidity < WEATHER_THRESHOLDS.humidity.min || 
        dayData.humidity > WEATHER_THRESHOLDS.humidity.max) {
      score -= 10;
      factors.push({ type: 'humidity', impact: 'negative' });
    }

    const finalScore = Math.max(0, score);
    return {
      score: finalScore,
      rating: this.getRatingFromScore(finalScore),
      factors
    };
  }

  /**
   * Convert numeric score to qualitative rating with type safety
   * @param score - Numeric suitability score (0-100)
   * @returns Typed rating category
   */
  private getRatingFromScore(score: number): SuitabilityScore['rating'] {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Map Visual Crossing icon codes to Font Awesome icon identifiers
   * @param iconCode - Visual Crossing weather icon code
   * @returns Font Awesome icon name for weather representation
   */
  private mapWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      'clear-day': 'sun',
      'clear-night': 'moon',
      'partly-cloudy-day': 'cloud-sun',
      'partly-cloudy-night': 'cloud-moon',
      'cloudy': 'cloud',
      'rain': 'cloud-rain',
      'snow': 'snowflake',
      'wind': 'wind',
      'fog': 'smog',
      'thunder': 'bolt'
    };

    return iconMap[iconCode] || 'cloud';
  }

  /**
   * Handle API errors with appropriate user-facing messages
   * Implements comprehensive error type checking and messaging
   * @param error - Axios error object from failed API request
   * @returns Error with user-friendly message
   */
  private handleApiError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          return new Error('Invalid API key. Please check your configuration.');
        case 404:
          return new Error('Location not found. Please try a different search.');
        case 429:
          return new Error('API rate limit exceeded. Please try again later.');
        default:
          return new Error('Weather service temporarily unavailable.');
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    }
    return new Error('An unexpected error occurred.');
  }

  /**
   * Generate cache key for location-based caching
   * @param location - Location string to cache
   * @returns Normalized cache key
   */
  private generateCacheKey(location: string): string {
    return `weather_${location.toLowerCase().replace(/\s/g, '_')}`;
  }

  /**
   * Retrieve cached data if available and not expired
   * @param key - Cache key for weather data
   * @returns Cached weather data or null if expired/missing
   */
  private getCachedData(key: string): WeatherData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store weather data in cache with timestamp
   * @param key - Cache key for storage
   * @param data - Weather data to cache
   */
  private setCachedData(key: string, data: WeatherData): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance for application-wide usage
const weatherService = new WeatherService();
export default weatherService;