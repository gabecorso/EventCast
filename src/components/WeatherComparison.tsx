import React, { useState, useCallback } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useWeather } from '../context/WeatherContext';
import WeekView from './WeekView';


/**
 * WeatherComparison component implementing side-by-side weather visualization
 * Facilitates comparative analysis between current and following week weather conditions
 * Enables meetup organizers to make data-driven scheduling decisions through visual comparison
 */
const WeatherComparison: React.FC = () => {
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

  if (!weatherData) {
    return null;
  }

  // Calculate date ranges for display with proper week boundaries
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const currentWeekEnd = addDays(currentWeekStart, 6);
  const nextWeekStart = addDays(currentWeekStart, 7);
  const nextWeekEnd = addDays(nextWeekStart, 6);

  return (
    <section className="weather-comparison" aria-label="Weekly weather comparison">
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
        <WeekView
          weekData={weatherData.currentWeek}
          weekType="current"
          selectedDay={selectedDay}
          selectedTimeRange={selectedTimeRange}
          expandedDay={expandedDay}
          onDayExpand={handleDayExpand}
        />
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
        <WeekView
          weekData={weatherData.nextWeek}
          weekType="next"
          selectedDay={selectedDay}
          selectedTimeRange={selectedTimeRange}
          expandedDay={expandedDay}
          onDayExpand={handleDayExpand}
        />
      </div>
    </section>
  );
};

export default WeatherComparison;