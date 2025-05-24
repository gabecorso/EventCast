import { HourlyData, TimeRangeAverages, WeatherCategory } from '../types';

/**
 * Utility functions with TypeScript type safety for the weather application
 * Provides reusable helper methods with proper type definitions
 */

/**
 * Debounce function implementation with TypeScript generics
 * Limits the rate at which a function can execute, essential for API optimization
 * @param func - Function to debounce with generic type parameters
 * @param wait - Delay in milliseconds before execution
 * @returns Debounced function maintaining original type signature
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>): void {
    const later = (): void => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format temperature value with degree symbol and unit designation
 * @param temp - Temperature value as number
 * @param unit - Temperature unit (Fahrenheit or Celsius)
 * @returns Formatted temperature string with degree symbol
 */
export function formatTemperature(temp: number, unit: 'F' | 'C' = 'F'): string {
  return `${Math.round(temp)}°${unit}`;
}

/**
 * Convert numeric day value to full day name
 * @param dayNumber - Day of week (0-6, where 0 represents Sunday)
 * @returns Full day name as string
 */
export function getDayName(dayNumber: number): string {
  const days: readonly string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || 'Invalid Day';
}

/**
 * Convert numeric day value to abbreviated day name
 * @param dayNumber - Day of week (0-6, where 0 represents Sunday)
 * @returns Three-letter abbreviated day name
 */
export function getShortDayName(dayNumber: number): string {
  const days: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayNumber] || 'N/A';
}

/**
 * Determine weather condition category for styling and visual representation
 * @param condition - Weather condition description from API
 * @returns Typed weather category for CSS class application
 */
export function getWeatherCategory(condition: string): WeatherCategory {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return 'sunny';
  } else if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return 'rainy';
  } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return 'stormy';
  } else if (conditionLower.includes('snow')) {
    return 'snowy';
  }
  
  return 'default';
}

/**
 * Calculate averaged weather metrics for specified time range
 * @param hourlyData - Array of hourly weather data points
 * @param startHour - Start hour (0-23) for range calculation
 * @param endHour - End hour (0-23) for range calculation
 * @returns Averaged weather metrics or null if no data available
 */
export function calculateTimeRangeAverages(
  hourlyData: HourlyData[],
  startHour: number,
  endHour: number
): TimeRangeAverages | null {
  const relevantHours = hourlyData.filter(hour => 
    hour.hour >= startHour && hour.hour <= endHour
  );
  
  if (relevantHours.length === 0) {
    return null;
  }
  
  const avgTemp = relevantHours.reduce((sum, hour) => sum + hour.temperature, 0) / relevantHours.length;
  const maxPrecipProb = Math.max(...relevantHours.map(hour => hour.precipProbability));
  const avgWindSpeed = relevantHours.reduce((sum, hour) => sum + hour.windSpeed, 0) / relevantHours.length;
  
  return {
    temperature: Math.round(avgTemp),
    precipProbability: maxPrecipProb,
    windSpeed: Math.round(avgWindSpeed),
    hourCount: relevantHours.length
  };
}

/**
 * Format hour value to 12-hour time format with AM/PM designation
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted time string in 12-hour format
 */
export function formatTime(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Determine if specified date string represents today's date
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Boolean indicating whether date is today
 */
export function isToday(dateString: string): boolean {
  const today = new Date();
  const compareDate = new Date(dateString);
  
  return today.getFullYear() === compareDate.getFullYear() &&
         today.getMonth() === compareDate.getMonth() &&
         today.getDate() === compareDate.getDate();
}

/**
 * Generate relative day description for improved user comprehension
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Relative day description (Today, Tomorrow, or day name)
 */
export function getRelativeDay(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isToday(dateString)) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return getDayName(date.getDay());
  }
}

/**
 * Type guard to check if a value is defined (not null or undefined)
 * @param value - Value to check for definition
 * @returns Boolean indicating whether value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}