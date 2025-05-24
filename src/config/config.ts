import { Config } from '../types/index';

/**
 * Application configuration with TypeScript type safety
 * Manages API keys, default values, and weather thresholds
 */
const config: Config = {
  // API Configuration
  VISUAL_CROSSING_API_KEY: process.env.REACT_APP_VISUAL_CROSSING_API_KEY || 'TBA',
  API_BASE_URL: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
  
  // Default Location
  DEFAULT_LOCATION: 'New York, NY',
  
  // Time Configuration
  DEFAULT_DAY: 5, // Friday (0 = Sunday, 6 = Saturday)
  DEFAULT_TIME_RANGES: [
    { label: 'Morning (9AM - 12PM)', start: 9, end: 12 },
    { label: 'Afternoon (2PM - 5PM)', start: 14, end: 17 },
    { label: 'Evening (5PM - 8PM)', start: 17, end: 20 }
  ],
  
  // Weather Thresholds for Suitability Scoring
  WEATHER_THRESHOLDS: {
    temperature: { min: 60, max: 75 }, // Fahrenheit
    precipitation: { max: 25 }, // Percentage
    windSpeed: { max: 20 }, // mph
    humidity: { min: 25, max: 75 } // Percentage
  }
};

// Validate configuration at runtime, add error for easy reading later when I forget
if (config.VISUAL_CROSSING_API_KEY === 'TBA') {
  console.warn('Visual Crossing API key not configured. Please set REACT_APP_VISUAL_CROSSING_API_KEY environment variable.');
}

export default config;