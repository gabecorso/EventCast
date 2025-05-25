import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { format, addDays, startOfWeek } from 'date-fns';
import { useWeather } from '../context/WeatherContext';
import WeekView from './WeekView';
import useIsMobile from '../hooks/useIsMobile';

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

  // Verify that we are on desktop or mobile to change the graph display
  const isMobile = useIsMobile();
  const [currentMobileWeek, setCurrentMobileWeek] = useState<'current' | 'next'>('current');


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
      if (isMobile) {
        if (direction === 'forward') {
          if (currentMobileWeek === 'current') {
            setCurrentMobileWeek('next');
          } else {
            // At 'next' week, load new data
            onNavigate(direction);
            setCurrentMobileWeek('current');
          }
        } else { // backward
          if (currentMobileWeek === 'next') {
            setCurrentMobileWeek('current');
          } else if (canNavigateBackward) {
            // At 'current' week, load previous data
            onNavigate(direction);
            setCurrentMobileWeek('next'); // Show the 'next' week of previous data
          }
        }
      } else {
        // Desktop behavior unchanged
        onNavigate(direction);
        setExpandedDay(null);
      }
    }
  }, [isNavigating, onNavigate, isMobile, currentMobileWeek, canNavigateBackward]);

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
          disabled={!canNavigateBackward || isNavigating || (isMobile && currentMobileWeek === 'current' && !canNavigateBackward)}
          aria-label="View previous two weeks"
          title={canNavigateBackward ? `View ${format(previousPeriodStart, 'MMM d')} - ${format(previousPeriodEnd, 'MMM d')}` : 'Cannot navigate before today'}
        >
          <FontAwesomeIcon 
            icon={['fas', isNavigating ? 'spinner' : 'chevron-left'] as IconProp} 
            spin={isNavigating}
          />
          {!isNavigating && canNavigateBackward && (
            <span className="navigation-preview">
            {isMobile && currentMobileWeek === 'next' 
              ? 'This Week' 
              : `${format(previousPeriodStart, 'MMM d')} - ${format(previousPeriodEnd, 'MMM d')}`
            }
          </span>
          )}
        </button>

        <div className={`weather-comparison ${isNavigating ? 'navigating' : ''} ${isMobile ? 'mobile' : 'desktop'}`}>
            {isMobile ? 
            (
                // Mobile: Single week view
                <div className="week-column mobile-week" role="region" aria-label={`${currentMobileWeek === 'current' ? 'Current' : 'Next'} week weather`}>
                  <div className="week-column-header">
                    <h2 className="week-label">
                      {currentMobileWeek === 'current' ? 'This Week' : 'Next Week'}
                    </h2>
                    <p className="date-range">
                      <time dateTime={format(currentMobileWeek === 'current' ? currentWeekStart : nextWeekStart, 'yyyy-MM-dd')}>
                        {format(currentMobileWeek === 'current' ? currentWeekStart : nextWeekStart, 'MMM d')}
                      </time>
                      {' - '}
                      <time dateTime={format(currentMobileWeek === 'current' ? currentWeekEnd : nextWeekEnd, 'yyyy-MM-dd')}>
                        {format(currentMobileWeek === 'current' ? currentWeekEnd : nextWeekEnd, 'MMM d, yyyy')}
                      </time>
                    </p>
                  </div>
                  <div className={`week-content ${isNavigating ? 'loading' : ''}`}>
                    <WeekView
                      weekData={currentMobileWeek === 'current' ? weatherData.currentWeek : weatherData.nextWeek}
                      weekType={currentMobileWeek}
                      selectedDay={selectedDay}
                      selectedTimeRange={selectedTimeRange}
                      expandedDay={expandedDay}
                      onDayExpand={handleDayExpand}
                    />
                    {isNavigating && <div className="loading-overlay" />}
                  </div>
                </div>
              ) : (
                <>
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
          </>
              )
        }
          
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
            {isMobile && currentMobileWeek === 'current'
              ? 'Next Week'
              : `${format(nextPeriodStart, 'MMM d')} - ${format(nextPeriodEnd, 'MMM d')}`
            }
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