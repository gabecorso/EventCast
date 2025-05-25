import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { format, addDays, startOfWeek } from 'date-fns';
import { useWeather } from '../context/WeatherContext';
import WeekView from './WeekView';

interface WeatherComparisonProps {
  currentWeekStart: Date;
  onNavigate: (direction: 'forward' | 'backward') => void;
  canNavigateBackward: boolean;
  isNavigating: boolean;
}

/**
 * WeatherComparison component implementing side-by-side weather visualization
 * Enhanced with navigation controls for exploring different week periods
 * Maintains visual continuity during data loading transitions
 */
const WeatherComparison: React.FC<WeatherComparisonProps> = ({
  currentWeekStart,
  onNavigate,
  canNavigateBackward,
  isNavigating
}) => {
  const { weatherData, selectedDay, selectedTimeRange } = useWeather();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  /**
   * Handle expansion state for detailed day view
   * Manages accordion-style interaction for hourly weather details
   * @param weekType - Identifier for current or next week
   * @param dayIndex - Index of the day within the week array
   */
  const handleDayExpand = useCallback((weekType: string, dayIndex: number): void => {
    const expandKey = `${weekType}-${dayIndex}`;
    setExpandedDay(prevExpanded => prevExpanded === expandKey ? null : expandKey);
  }, []);

  /**
   * Handle navigation with loading state management
   * Prevents multiple simultaneous navigation requests
   */
  const handleNavigation = useCallback((direction: 'forward' | 'backward'): void => {
    if (!isNavigating) {
      onNavigate(direction);
      // Clear expanded state when navigating to new weeks
      setExpandedDay(null);
    }
  }, [isNavigating, onNavigate]);

  if (!weatherData) {
    return null;
  }

  // Calculate date ranges for display
  const currentWeekEnd = addDays(currentWeekStart, 6);
  const nextWeekStart = addDays(currentWeekStart, 7);
  const nextWeekEnd = addDays(nextWeekStart, 6);

  // Calculate navigation preview dates
  const previousPeriodStart = addDays(currentWeekStart, -14);
  const previousPeriodEnd = addDays(currentWeekStart, -1);
  const nextPeriodStart = addDays(currentWeekStart, 14);
  const nextPeriodEnd = addDays(currentWeekStart, 27);

  return (
    <section className="weather-comparison-wrapper" aria-label="Weekly weather comparison">
      <div className="navigation-controls">
        <button
          className={`navigation-arrow navigation-arrow-left ${!canNavigateBackward || isNavigating ? 'disabled' : ''}`}
          onClick={() => handleNavigation('backward')}
          disabled={!canNavigateBackward || isNavigating}
          aria-label="View previous two weeks"
          title={canNavigateBackward ? `View ${format(previousPeriodStart, 'MMM d')} - ${format(previousPeriodEnd, 'MMM d')}` : 'Cannot navigate before today'}
        >
          <FontAwesomeIcon 
            icon={['fas', isNavigating ? 'spinner' : 'chevron-left'] as IconProp} 
            spin={isNavigating}
          />
          {!isNavigating && canNavigateBackward && (
            <span className="navigation-preview">
              {format(previousPeriodStart, 'MMM d')} - {format(previousPeriodEnd, 'MMM d')}
            </span>
          )}
        </button>

        <div className={`weather-comparison ${isNavigating ? 'navigating' : ''}`}>
          <div className="week-column" role="region" aria-label="Current week weather">
            <div className="week-column-header">
              <h2 className="week-label">This Week</h2>
              <p className="date-range">
                <time dateTime={format(currentWeekStart, 'yyyy-MM-dd')}>
                  {format(currentWeekStart, 'MMM d')}
                </time>
                {' - '}
                <time dateTime={format(currentWeekEnd, 'yyyy-MM-dd')}>
                  {format(currentWeekEnd, 'MMM d, yyyy')}
                </time>
              </p>
            </div>
            <div className={`week-content ${isNavigating ? 'loading' : ''}`}>
              <WeekView
                weekData={weatherData.currentWeek}
                weekType="current"
                selectedDay={selectedDay}
                selectedTimeRange={selectedTimeRange}
                expandedDay={expandedDay}
                onDayExpand={handleDayExpand}
              />
              {isNavigating && <div className="loading-overlay" />}
            </div>
          </div>

          <div className="week-column" role="region" aria-label="Next week weather">
            <div className="week-column-header">
              <h2 className="week-label">Next Week</h2>
              <p className="date-range">
                <time dateTime={format(nextWeekStart, 'yyyy-MM-dd')}>
                  {format(nextWeekStart, 'MMM d')}
                </time>
                {' - '}
                <time dateTime={format(nextWeekEnd, 'yyyy-MM-dd')}>
                  {format(nextWeekEnd, 'MMM d, yyyy')}
                </time>
              </p>
            </div>
            <div className={`week-content ${isNavigating ? 'loading' : ''}`}>
              <WeekView
                weekData={weatherData.nextWeek}
                weekType="next"
                selectedDay={selectedDay}
                selectedTimeRange={selectedTimeRange}
                expandedDay={expandedDay}
                onDayExpand={handleDayExpand}
              />
              {isNavigating && <div className="loading-overlay" />}
            </div>
          </div>
        </div>

        <button
          className={`navigation-arrow navigation-arrow-right ${isNavigating ? 'disabled' : ''}`}
          onClick={() => handleNavigation('forward')}
          disabled={isNavigating}
          aria-label="View next two weeks"
          title={`View ${format(nextPeriodStart, 'MMM d')} - ${format(nextPeriodEnd, 'MMM d')}`}
        >
          <FontAwesomeIcon 
            icon={['fas', isNavigating ? 'spinner' : 'chevron-right'] as IconProp} 
            spin={isNavigating}
          />
          {!isNavigating && (
            <span className="navigation-preview">
              {format(nextPeriodStart, 'MMM d')} - {format(nextPeriodEnd, 'MMM d')}
            </span>
          )}
        </button>
      </div>
      
      {isNavigating && (
        <div className="navigation-progress" role="status" aria-live="polite">
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <p className="progress-text">Loading weather data...</p>
        </div>
      )}
    </section>
  );
};

export default WeatherComparison;