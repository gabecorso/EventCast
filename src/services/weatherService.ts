import axios, { AxiosError, AxiosResponse } from 'axios';
import { addDays, format, startOfDay, differenceInDays, isWithinInterval } from 'date-fns';
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
  data: DayWeather[];
  timestamp: number;
  startDate: Date;
  endDate: Date;
}

interface LocationCache {
  [dateRangeKey: string]: CacheEntry;
}

/**
 * WeatherService class implementing comprehensive weather data management
 * Enhanced with intelligent caching for multi-week navigation
 * Provides type-safe API interactions with optimized data fetching strategies
 */
class WeatherService {
  private cache: Map<string, LocationCache>;
  private readonly cacheTimeout: number;
  private readonly bufferDays: number = 28; // Fetch 4 weeks at a time

  constructor() {
    this.cache = new Map<string, LocationCache>();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache duration
  }

  /**
   * Fetch weather forecast for specified location and date range
   * Implements intelligent caching with overlapping date windows
   * @param location - Location string (city, state, or coordinates)
   * @param startDate - Beginning of the requested period
   * @param requestedDays - Number of days to retrieve (default 14 for two weeks)
   * @returns Promise resolving to weather data for the requested period
   */
  public async getWeatherForecast(
    location: string, 
    startDate: Date = new Date(),
    requestedDays: number = 14
  ): Promise<WeatherData> {
    const normalizedStartDate = startOfDay(startDate);
    const endDate = addDays(normalizedStartDate, requestedDays - 1);
    
    // Check cache for existing data
    const cachedData = this.getCachedDataForRange(location, normalizedStartDate, endDate);
    if (cachedData) {
      return this.formatWeatherResponse(location, cachedData, normalizedStartDate);
    }

    // Determine optimal fetch range with buffer
    const fetchRange = this.calculateOptimalFetchRange(location, normalizedStartDate, requestedDays);
    
    try {
      const response: AxiosResponse<VisualCrossingAPIResponse> = await axios.get(
        `${config.API_BASE_URL}/${encodeURIComponent(location)}/${format(fetchRange.start, 'yyyy-MM-dd')}/${format(fetchRange.end, 'yyyy-MM-dd')}`,
        {
          params: {
            key: config.VISUAL_CROSSING_API_KEY,
            unitGroup: 'us',
            include: 'days,hours',
            elements: 'datetime,tempmax,tempmin,temp,humidity,precip,precipprob,windspeed,windgust,conditions,icon,description'
          },
          timeout: 10000
        }
      );

      const processedDays = this.processWeatherData(response.data);
      this.cacheDataForLocation(location, processedDays, fetchRange.start, fetchRange.end);
      
      // Extract requested range from fetched data
      const requestedData = processedDays.filter(day => {
        const dayDate = new Date(day.date);
        return isWithinInterval(dayDate, { start: normalizedStartDate, end: endDate });
      });
      
      return this.formatWeatherResponse(response.data.resolvedAddress, requestedData, normalizedStartDate);
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  /**
   * Calculate optimal date range for API fetch with intelligent buffering
   * Minimizes API calls by fetching larger chunks when appropriate
   */
  private calculateOptimalFetchRange(
    location: string, 
    startDate: Date, 
    requestedDays: number
  ): { start: Date; end: Date } {
    const locationCache = this.cache.get(this.generateLocationKey(location));
    
    if (!locationCache) {
      // No cache exists, fetch with full buffer
      return {
        start: startDate,
        end: addDays(startDate, Math.max(this.bufferDays, requestedDays) - 1)
      };
    }

    // Check for gaps in cached data
    const endDate = addDays(startDate, requestedDays - 1);
    let fetchStart = startDate;
    let fetchEnd = endDate;

    // Extend range to include buffer for smooth navigation
    if (requestedDays <= 14) {
      fetchEnd = addDays(startDate, this.bufferDays - 1);
    }

    return { start: fetchStart, end: fetchEnd };
  }

  /**
   * Retrieve cached data for specific date range if available and valid
   * Checks both cache existence and timeout validity
   */
  private getCachedDataForRange(
    location: string, 
    startDate: Date, 
    endDate: Date
  ): DayWeather[] | null {
    const locationKey = this.generateLocationKey(location);
    const locationCache = this.cache.get(locationKey);
    
    if (!locationCache) return null;

    // Check all cache entries for this location
    for (const [_, entry] of Object.entries(locationCache)) {
      if (Date.now() - entry.timestamp > this.cacheTimeout) continue;
      
      // Check if requested range is within cached range
      if (startDate >= entry.startDate && endDate <= entry.endDate) {
        return entry.data.filter(day => {
          const dayDate = new Date(day.date);
          return isWithinInterval(dayDate, { start: startDate, end: endDate });
        });
      }
    }
    
    return null;
  }

  /**
   * Cache weather data with location and date range indexing
   * Enables efficient retrieval for overlapping date requests
   */
  private cacheDataForLocation(
    location: string, 
    data: DayWeather[], 
    startDate: Date, 
    endDate: Date
  ): void {
    const locationKey = this.generateLocationKey(location);
    const rangeKey = `${format(startDate, 'yyyy-MM-dd')}_${format(endDate, 'yyyy-MM-dd')}`;
    
    if (!this.cache.has(locationKey)) {
      this.cache.set(locationKey, {});
    }
    
    const locationCache = this.cache.get(locationKey)!;
    locationCache[rangeKey] = {
      data,
      timestamp: Date.now(),
      startDate,
      endDate
    };

    // Clean up old cache entries for this location
    this.cleanupLocationCache(locationCache);
  }

  /**
   * Remove expired cache entries to prevent memory bloat
   */
  private cleanupLocationCache(locationCache: LocationCache): void {
    const now = Date.now();
    Object.keys(locationCache).forEach(key => {
      if (now - locationCache[key].timestamp > this.cacheTimeout) {
        delete locationCache[key];
      }
    });
  }

  /**
   * Format weather data response for specific date range
   * Splits data into current and next week for comparison view
   */
  private formatWeatherResponse(
    location: string, 
    days: DayWeather[], 
    startDate: Date
  ): WeatherData {
    // Ensure we have exactly 14 days for the two-week view
    const currentWeek = days.slice(0, 7);
    const nextWeek = days.slice(7, 14);

    return {
      location,
      timezone: 'America/New_York', // This should come from API in production
      currentWeek,
      nextWeek,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Process raw API data into application-specific format
   * Maintains existing transformation logic
   */
  private processWeatherData(apiData: VisualCrossingAPIResponse): DayWeather[] {
    return apiData.days.map(day => ({
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
   * Calculate suitability score for days without hourly data
   * Uses daily averages and statistical data for assessment
   * @param dayData - Daily weather data from API (statistical forecast)
   * @returns Typed suitability score with rating and factors
   */
  private calculateDailySuitabilityScore(dayData: VisualCrossingDay): SuitabilityScore {
    const { WEATHER_THRESHOLDS } = config;
    let score = 100;
    const factors: SuitabilityFactor[] = [];

    // Temperature evaluation using daily high/low
    if (dayData.tempmax < WEATHER_THRESHOLDS.temperature.min) {
      score -= 25; // Slightly higher penalty for daily assessment
      factors.push({ type: 'cold', impact: 'negative' });
    } else if (dayData.tempmax > WEATHER_THRESHOLDS.temperature.max) {
      score -= 20;
      factors.push({ type: 'hot', impact: 'negative' });
    } else if (dayData.tempmin >= WEATHER_THRESHOLDS.temperature.min - 5 && 
               dayData.tempmax <= WEATHER_THRESHOLDS.temperature.max + 5) {
      factors.push({ type: 'temperature', impact: 'positive' });
    }

    // Precipitation evaluation - same as hourly
    if (dayData.precipprob > WEATHER_THRESHOLDS.precipitation.max) {
      score -= 30;
      factors.push({ type: 'rain', impact: 'negative' });
    }

    // Wind evaluation using daily average
    if (dayData.windspeed > WEATHER_THRESHOLDS.windSpeed.max) {
      score -= 20;
      factors.push({ type: 'wind', impact: 'negative' });
    }

    // Humidity evaluation - same as hourly
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
   * Generate location-specific cache key
   * @param location - Location string to cache
   * @returns Normalized cache key
   */
  private generateLocationKey(location: string): string {
    return `weather_${location.toLowerCase().replace(/\s/g, '_')}`;
  }

  /**
   * Clear all cached data for a specific location
   * Useful when location changes or manual refresh is requested
   */
  public clearLocationCache(location: string): void {
    const locationKey = this.generateLocationKey(location);
    this.cache.delete(locationKey);
  }

  /**
   * Get cache statistics for monitoring and debugging
   */
  public getCacheStats(): { locations: number; totalEntries: number } {
    let totalEntries = 0;
    this.cache.forEach(locationCache => {
      totalEntries += Object.keys(locationCache).length;
    });
    
    return {
      locations: this.cache.size,
      totalEntries
    };
  }
}

// Export singleton instance for application-wide usage
const weatherService = new WeatherService();
export default weatherService;