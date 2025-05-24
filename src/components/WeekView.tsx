import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { format } from 'date-fns';
import { 
  formatTemperature, 
  getRelativeDay, 
  calculateTimeRangeAverages,
  getWeatherCategory,
  formatTime 
} from '../utils/helpers';
import { WeekViewProps, DayWeather, TimeRangeAverages } from '../types';
import WeatherChart from './WeatherChart';

/**
 * WeekView component implementing comprehensive weather data display with TypeScript
 * Manages visual presentation of daily weather information with expandable details
 * Provides filtered display based on selected day and interactive hourly breakdowns
 */
const WeekView: React.FC<WeekViewProps> = ({ 
  weekData, 
  weekType, 
  selectedDay, 
  selectedTimeRange, 
  expandedDay, 
  onDayExpand 
}) => {
  /**
   * Filter weather data to display only the user-selected day of the week
   * Ensures consistent display of recurring meetup days across both weeks
   */
  const filteredDays: DayWeather[] = weekData.filter(day => day.dayOfWeek === selectedDay);

  /**
   * Render individual day weather information with comprehensive details
   * Implements expandable interface for accessing hourly weather breakdowns
   * @param day - Daily weather data object
   * @param index - Position index within filtered days array
   * @returns JSX element representing complete day weather display
   */
  const renderDayWeather = (day: DayWeather, index: number): React.ReactNode => {
    const expandKey = `${weekType}-${index}`;
    const isExpanded = expandedDay === expandKey;
    const weatherCategory = getWeatherCategory(day.conditions);
    const timeRangeData: TimeRangeAverages | null = calculateTimeRangeAverages(
      day.hourlyData, 
      selectedTimeRange.start, 
      selectedTimeRange.end
    );

    return (
      <article 
        key={day.date} 
        className={`daily-weather-item ${weatherCategory} ${isExpanded ? 'expanded' : ''}`}
        aria-expanded={isExpanded}
      >
        <header 
          className="day-header" 
          onClick={() => onDayExpand(weekType, index)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDayExpand(weekType, index);
            }
          }}
          aria-label={`Weather for ${getRelativeDay(day.date)}. Click to ${isExpanded ? 'collapse' : 'expand'} details`}
        >
          <div className="date-info">
            <span className="day-name">{getRelativeDay(day.date)}</span>
            <time className="date" dateTime={day.date}>
              {format(new Date(day.date), 'MMM d')}
            </time>
          </div>
          
          <div className="weather-summary">
            <FontAwesomeIcon 
              icon={['fas', day.icon] as IconProp} 
              className="weather-icon"
              size="2x"
              aria-label={day.conditions}
            />
            <div className="temperature-range">
              <span className="temp-high" aria-label="High temperature">
                {formatTemperature(day.temperatures.max)}
              </span>
              <span className="temp-low" aria-label="Low temperature">
                {formatTemperature(day.temperatures.min)}
              </span>
            </div>
          </div>
          
          <div className="conditions-summary">
            <p className="conditions-text">{day.conditions}</p>
            <div className="weather-metrics">
              {day.precipitation.probability > 0 && (
                <span className="metric rain-chance" aria-label="Chance of rain">
                  <FontAwesomeIcon icon={['fas', 'tint'] as IconProp} />
                  {day.precipitation.probability}%
                </span>
              )}
              <span className="metric wind" aria-label="Wind speed">
                <FontAwesomeIcon icon={['fas', 'wind'] as IconProp} />
                {day.wind.speed} mph
              </span>
            </div>
          </div>
          
          <div className="suitability-indicator">
            <div 
              className={`suitability-badge ${day.suitabilityScore.rating}`}
              role="status"
              aria-label={`Weather suitability: ${day.suitabilityScore.rating}`}
            >
              {day.suitabilityScore.rating.charAt(0).toUpperCase() + day.suitabilityScore.rating.slice(1)}
            </div>
            <button 
              className="expand-button"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              onClick={(e) => e.stopPropagation()}
            >
              <FontAwesomeIcon 
                icon={['fas', isExpanded ? 'chevron-up' : 'chevron-down'] as IconProp} 
              />
            </button>
          </div>
        </header>
        
        {isExpanded && (
          <section className="expanded-details" aria-label="Detailed weather information">
            <div className="time-range-summary">
              <h4>Weather during {selectedTimeRange.label}</h4>
              {timeRangeData ? (
                <div className="time-range-metrics">
                  <div className="metric-item">
                    <FontAwesomeIcon icon={['fas', 'temperature-high'] as IconProp} />
                    <span>Average Temperature: {formatTemperature(timeRangeData.temperature)}</span>
                  </div>
                  <div className="metric-item">
                    <FontAwesomeIcon icon={['fas', 'cloud-rain'] as IconProp} />
                    <span>Rain Chance: {timeRangeData.precipProbability}%</span>
                  </div>
                  <div className="metric-item">
                    <FontAwesomeIcon icon={['fas', 'wind'] as IconProp} />
                    <span>Average Wind: {timeRangeData.windSpeed} mph</span>
                  </div>
                </div>
              ) : (
                <p className="no-data">No data available for the selected time range</p>
              )}
            </div>
            
            <div className="hourly-forecast">
              <h4>Hourly Breakdown</h4>
              <div className="hourly-grid">
                {day.hourlyData
                  .filter(hour => hour.hour >= selectedTimeRange.start && hour.hour <= selectedTimeRange.end)
                  .map(hour => (
                    <div key={hour.time} className="hourly-item">
                      <time className="hour-time">{formatTime(hour.hour)}</time>
                      <FontAwesomeIcon 
                        icon={['fas', hour.icon] as IconProp} 
                        className="hour-icon" 
                        aria-label={hour.conditions}
                      />
                      <span className="hour-temp">{formatTemperature(hour.temperature)}</span>
                      {hour.precipProbability > 0 && (
                        <span className="hour-precip" aria-label="Precipitation chance">
                          {hour.precipProbability}%
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="suitability-factors">
              <h4>Weather Assessment Details</h4>
              <p className="score">
                Overall Suitability Score: <strong>{day.suitabilityScore.score}/100</strong>
              </p>
              <div className="factors-list" role="list">
                {day.suitabilityScore.factors.map((factor, idx) => (
                  <span 
                    key={idx} 
                    className={`factor ${factor.impact}`}
                    role="listitem"
                  >
                    {factor.type.charAt(0).toUpperCase() + factor.type.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    );
  };

  return (
    <div className="week-view">
      {filteredDays.length > 0 ? (
        <>
          {/* Display chart for the selected day's hourly data */}
          {filteredDays.length === 1 && (
            <WeatherChart
              hourlyData={filteredDays[0].hourlyData}
              selectedTimeRange={selectedTimeRange}
              weekType={weekType}
            />
          )}
          
          <div className="daily-weather-grid" role="list">
            {filteredDays.map((day, index) => renderDayWeather(day, index))}
          </div>
        </>
      ) : (
        <div className="no-data-message" role="status">
          <FontAwesomeIcon icon={['fas', 'calendar-times'] as IconProp} size="2x" />
          <p>No weather data is available for the selected day in this week.</p>
        </div>
      )}
    </div>
  );
};

export default WeekView;