import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { format } from 'date-fns';
import { formatTemperature, getRelativeDay, getWeatherCategory } from '../utils/helpers';
import { DayWeather } from '../types';

interface SimplifiedWeatherCardProps {
  day: DayWeather;
  isSelected: boolean;
}

/**
 * SimplifiedWeatherCard component for displaying daily weather without hourly data
 * Used for statistical forecast periods beyond 15-day detailed forecast window
 * Presents key metrics in a condensed format with visual suitability indicators
 */
const SimplifiedWeatherCard: React.FC<SimplifiedWeatherCardProps> = ({ day, isSelected }) => {
  const weatherCategory = getWeatherCategory(day.conditions);
  const suitabilityRating = day.suitabilityScore.rating;
  const score = day.suitabilityScore.score;

  // Determine background color class based on suitability score
  const getScoreColorClass = (score: number): string => {
    if (score >= 80) return 'excellent-bg';
    if (score >= 60) return 'good-bg';
    if (score >= 40) return 'fair-bg';
    return 'poor-bg';
  };

  const scoreColorClass = getScoreColorClass(score);
  return (
    <article 
      className={`simplified-weather-card ${scoreColorClass} ${suitabilityRating} ${isSelected ? 'selected' : ''}`}
      aria-label={`Weather forecast for ${getRelativeDay(day.date)}`}
    >
      <div className="card-header">
        <div className="date-info">
          <span className="day-name">{getRelativeDay(day.date)}</span>
          <time className="date" dateTime={day.date}>
            {format(new Date(day.date), 'MMM d')}
          </time>
        </div>
        <div className={`suitability-score-badge ${suitabilityRating}`}>
          <span className="score-number">{score}</span>
          <span className="score-label">{suitabilityRating}</span>
        </div>
      </div>

      <div className="weather-icon-section">
        <FontAwesomeIcon 
          icon={['fas', day.icon] as IconProp} 
          className="weather-icon"
          size="3x"
          aria-label={day.conditions}
        />
        {day.conditions && <p className="conditions-text">{day.conditions}</p>}
      </div>

      <div className="primary-metrics">
        <div className="metric-card temperature">
          <div className="metric-header">
            <FontAwesomeIcon icon={['fas', 'temperature-high'] as IconProp} className="metric-icon" />
            <span className="metric-label">Temperature</span>
          </div>
          <div className="metric-value-large">
            <span className="temp-high">{formatTemperature(day.temperatures.max)}</span>
            <span className="temp-divider">|</span>
            <span className="temp-low">{formatTemperature(day.temperatures.min)}</span>
          </div>
        </div>

        <div className="metric-card precipitation">
          <div className="metric-header">
            <FontAwesomeIcon icon={['fas', 'cloud-rain'] as IconProp} className="metric-icon" />
            <span className="metric-label">Precipitation</span>
          </div>
          <div className="metric-value-large">
            <span className="precip-chance">{Math.round(day.precipitation.probability)}%</span>
            {day.precipitation.amount > 0 && (
              <span className="precip-amount">({day.precipitation.amount}")</span>
            )}
          </div>
        </div>

        <div className="metric-card wind">
          <div className="metric-header">
            <FontAwesomeIcon icon={['fas', 'wind'] as IconProp} className="metric-icon" />
            <span className="metric-label">Wind</span>
          </div>
          <div className="metric-value-large">
            <span className="wind-speed">{day.wind.speed}</span>
            <span className="wind-unit">mph</span>
            {day.wind.gust && (
              <span className="wind-gust">(gusts {day.wind.gust})</span>
            )}
          </div>
        </div>
      </div>

      <div className="suitability-factors">
        {day.suitabilityScore.factors.map((factor, idx) => (
          <span 
            key={idx} 
            className={`factor-chip ${factor.impact}`}
          >
            <FontAwesomeIcon 
              icon={['fas', factor.impact === 'positive' ? 'check' : 'times'] as IconProp} 
              className="factor-icon" 
            />
            {factor.type}
          </span>
        ))}
      </div>

      <div className="statistical-notice">
        <FontAwesomeIcon icon={['fas', 'chart-line'] as IconProp} className="notice-icon" />
        <span className="caption">*Detailed statistical forecast unavailable more than 14 days in the future</span>
      </div>
    </article>
  );
};

export default SimplifiedWeatherCard;