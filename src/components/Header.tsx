import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
// import LocationSelector from './LocationSelector';
// import DaySelector from './DaySelector';
// import TimeRangeSelector from './TimeRangeSelector';
import { useWeather } from '../context/WeatherContext';
import { getDayName } from '../utils/helpers';
import LocationSelector from './LocationSelector';
import DaySelector from './DaySelector';

/**
 * Header component implementing primary application controls with TypeScript
 * Manages location input, day selection, and time range selection functionality
 * Provides real-time summary of current selection state for user clarity
 */
const Header: React.FC = () => {
  const { location, selectedDay, selectedTimeRange } = useWeather();

  return (
    <header className="app-header" role="banner">
      <div className="header-content">
        <div className="app-title">
          <FontAwesomeIcon 
            icon={['fas', 'cloud-sun'] as IconProp} 
            className="app-icon" 
            aria-hidden="true"
          />
          <h1>Weather Planner for Outdoor Meetups</h1>
        </div>
        
        <nav className="header-controls" role="navigation" aria-label="Weather controls">
            <LocationSelector />
            <DaySelector />
          {/* <LocationSelector />
          <DaySelector />
          <TimeRangeSelector /> */}
        </nav>
        
        <div className="header-summary" role="status" aria-live="polite">
          <p className="summary-text">
            Viewing weather for <strong>{location}</strong> on{' '}
            <strong>{getDayName(selectedDay)}s</strong> during{' '}
            <strong>{selectedTimeRange.label}</strong>
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;