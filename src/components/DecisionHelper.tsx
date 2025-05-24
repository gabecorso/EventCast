import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useWeather } from '../context/WeatherContext';
import { getDayName, formatTemperature } from '../utils/helpers';
import { DayWeather, WeatherRecommendation } from '../types';

/**
 * DecisionHelper component implementing intelligent weather recommendation system
 * Analyzes comparative weather data to provide actionable scheduling guidance
 * Synthesizes multiple meteorological factors into clear, practical recommendations
 */
const DecisionHelper: React.FC = () => {
  const { weatherData, selectedDay, selectedTimeRange } = useWeather();

  if (!weatherData) {
    return null;
  }

  /**
   * Retrieve weather data for the selected day from both weekly datasets
   * Ensures comparison operates on equivalent days across consecutive weeks
   */
  const currentWeekDay: DayWeather | undefined = weatherData.currentWeek.find(
    day => day.dayOfWeek === selectedDay
  );
  const nextWeekDay: DayWeather | undefined = weatherData.nextWeek.find(
    day => day.dayOfWeek === selectedDay
  );

  if (!currentWeekDay || !nextWeekDay) {
    return (
      <div className="decision-helper" role="region" aria-label="Weather recommendation">
        <div className="decision-helper-header">
          <FontAwesomeIcon icon={['fas', 'lightbulb'] as IconProp} className="header-icon" />
          <h3>Weather Recommendation</h3>
        </div>
        <p>Unable to provide recommendations. Weather data not available for the selected day.</p>
      </div>
    );
  }

  /**
   * Analyze suitability scores to determine comparative weather quality
   * Calculates differential to quantify improvement or degradation between weeks
   */
  const currentScore: number = currentWeekDay.suitabilityScore.score;
  const nextScore: number = nextWeekDay.suitabilityScore.score;
  const scoreDifference: number = nextScore - currentScore;

  /**
   * Generate comprehensive recommendation based on score analysis and thresholds
   * Implements sophisticated decision logic accounting for various weather scenarios
   * @returns Structured recommendation object with type, title, message, and icon
   */
  const generateRecommendation = (): WeatherRecommendation => {
    if (currentScore >= 80 && nextScore >= 80) {
      return {
        type: 'excellent',
        title: 'Both weeks look great!',
        message: 'Weather conditions are excellent for both weeks. You can confidently plan your meetup for either week without weather-related concerns.',
        icon: 'sun'
      };
    } else if (currentScore >= 60 && nextScore >= 60) {
      return {
        type: 'good',
        title: scoreDifference > 10 ? 'Next week is better' : 'This week is slightly better',
        message: `Both weeks present acceptable weather conditions for outdoor activities. However, ${scoreDifference > 10 ? 'next' : 'this'} week offers more favorable conditions based on our comprehensive analysis.`,
        icon: 'cloud-sun'
      };
    } else if (currentScore < 40 && nextScore < 40) {
      return {
        type: 'poor',
        title: 'Consider rescheduling',
        message: 'Weather conditions are challenging for both weeks, presenting significant risks for outdoor events. We recommend considering an indoor venue or postponing to a later date when conditions may improve.',
        icon: 'cloud-rain'
      };
    } else if (scoreDifference >= 20) {
      return {
        type: 'recommendation',
        title: 'Postpone to next week',
        message: `Next week's weather conditions are significantly superior to this week's forecast (${nextScore}/100 compared to ${currentScore}/100). We strongly recommend postponing your event to take advantage of the improved conditions.`,
        icon: 'calendar-check'
      };
    } else if (scoreDifference <= -20) {
      return {
        type: 'recommendation',
        title: 'Host this week',
        message: `This week's weather conditions are significantly better than next week's forecast (${currentScore}/100 compared to ${nextScore}/100). We recommend proceeding with your event as originally planned.`,
        icon: 'calendar-day'
      };
    } else {
      return {
        type: 'neutral',
        title: 'Similar conditions',
        message: 'Weather conditions are comparable for both weeks, with no significant advantage to either option. Consider other factors such as attendee availability when making your final decision.',
        icon: 'balance-scale'
      };
    }
  };

  /**
   * Identify specific meteorological concerns for risk assessment
   * Evaluates multiple weather factors against established thresholds
   * @param day - Daily weather data to analyze for concerns
   * @returns Array of identified weather concerns as formatted strings
   */
  const getWeatherConcerns = (day: DayWeather): string[] => {
    const concerns: string[] = [];
    
    if (day.precipitation.probability > 60) {
      concerns.push(`High rain probability (${day.precipitation.probability}%)`);
    }
    if (day.wind.speed > 20) {
      concerns.push(`Strong winds expected (${day.wind.speed} mph)`);
    }
    if (day.temperatures.max > 85) {
      concerns.push(`High temperature warning (${formatTemperature(day.temperatures.max)})`);
    }
    if (day.temperatures.max < 50) {
      concerns.push(`Low temperature advisory (${formatTemperature(day.temperatures.max)})`);
    }
    
    return concerns;
  };

  const recommendation: WeatherRecommendation = generateRecommendation();
  const currentWeekConcerns: string[] = getWeatherConcerns(currentWeekDay);
  const nextWeekConcerns: string[] = getWeatherConcerns(nextWeekDay);

  return (
    <section className="decision-helper" role="region" aria-label="Weather recommendation">
      <div className="decision-helper-header">
        <FontAwesomeIcon icon={['fas', 'lightbulb'] as IconProp} className="header-icon" />
        <h3>Weather Recommendation</h3>
      </div>
      
      <div className="recommendation-card">
        <div className={`recommendation-type ${recommendation.type}`}>
          <FontAwesomeIcon icon={['fas', recommendation.icon] as IconProp} size="2x" />
          <h4>{recommendation.title}</h4>
          <p>{recommendation.message}</p>
        </div>
      </div>
      
      <div className="decision-helper-content">
        <div className="week-comparison">
          <div className="comparison-item current-week">
            <h4>This {getDayName(selectedDay)}</h4>
            <div className="score-display">
              <span className={`score ${currentWeekDay.suitabilityScore.rating}`}>
                {currentScore}/100
              </span>
              <span className="rating">{currentWeekDay.suitabilityScore.rating}</span>
            </div>
            {currentWeekConcerns.length > 0 && (
              <div className="concerns">
                <h5>Weather Concerns:</h5>
                <ul role="list">
                  {currentWeekConcerns.map((concern, index) => (
                    <li key={index} role="listitem">{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="comparison-item next-week">
            <h4>Next {getDayName(selectedDay)}</h4>
            <div className="score-display">
              <span className={`score ${nextWeekDay.suitabilityScore.rating}`}>
                {nextScore}/100
              </span>
              <span className="rating">{nextWeekDay.suitabilityScore.rating}</span>
            </div>
            {nextWeekConcerns.length > 0 && (
              <div className="concerns">
                <h5>Weather Concerns:</h5>
                <ul role="list">
                  {nextWeekConcerns.map((concern, index) => (
                    <li key={index} role="listitem">{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="additional-tips">
          <h4>Essential Planning Considerations</h4>
          <div className="tips-grid">
            <div className="tip">
              <FontAwesomeIcon icon={['fas', 'umbrella'] as IconProp} className="tip-icon" />
              <p>Always maintain a backup indoor location to ensure event continuity regardless of weather conditions</p>
            </div>
            <div className="tip">
              <FontAwesomeIcon icon={['fas', 'mobile-alt'] as IconProp} className="tip-icon" />
              <p>Check the forecast again 24 hours before your event for the most accurate weather predictions</p>
            </div>
            <div className="tip">
              <FontAwesomeIcon icon={['fas', 'users'] as IconProp} className="tip-icon" />
              <p>Communicate weather updates to attendees early to facilitate proper preparation and maximize attendance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DecisionHelper;