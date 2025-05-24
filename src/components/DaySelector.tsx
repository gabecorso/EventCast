import React, { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useWeather } from '../context/WeatherContext';
import { getDayName } from '../utils/helpers';

interface DayOption {
  value: number;
  label: string;
  abbrev: string;
}

/**
 * DaySelector component implementing day-of-week selection functionality with TypeScript
 * Facilitates filtering of weather data to display only user-specified recurring days
 * Designed to support event planning workflows where meetups occur on consistent weekdays
 */
const DaySelector: React.FC = () => {
  const { selectedDay, handleDayChange } = useWeather();

  /**
   * Define comprehensive day options with proper typing for select element
   * Maintains consistency between numeric values and display labels
   */
  const days: readonly DayOption[] = [
    { value: 0, label: 'Sunday', abbrev: 'Sun' },
    { value: 1, label: 'Monday', abbrev: 'Mon' },
    { value: 2, label: 'Tuesday', abbrev: 'Tue' },
    { value: 3, label: 'Wednesday', abbrev: 'Wed' },
    { value: 4, label: 'Thursday', abbrev: 'Thu' },
    { value: 5, label: 'Friday', abbrev: 'Fri' },
    { value: 6, label: 'Saturday', abbrev: 'Sat' }
  ];

  /**
   * Handle day selection change events with proper type conversion
   * Ensures numeric day values are correctly parsed and propagated
   * @param event - React change event from select element
   */
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const newDay = parseInt(event.target.value, 10);
    if (!isNaN(newDay) && newDay >= 0 && newDay <= 6) {
      handleDayChange(newDay);
    }
  };

  return (
    <div className="day-selector" role="group" aria-labelledby="day-selector-label">
      <label 
        id="day-selector-label" 
        htmlFor="day-select" 
        className="day-selector-label"
      >
        <FontAwesomeIcon 
          icon={['fas', 'calendar-day'] as IconProp} 
          className="label-icon" 
          aria-hidden="true"
        />
        <span>Meetup Day</span>
      </label>
      <select
        id="day-select"
        value={selectedDay}
        onChange={handleChange}
        className="day-selector-dropdown"
        aria-label="Select recurring meetup day"
        aria-describedby="day-selector-preview"
      >
        {days.map(day => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
      <div id="day-selector-preview" className="day-selector-preview">
        <p className="preview-text">
          Showing weather for <strong>{getDayName(selectedDay)}s</strong>
        </p>
      </div>
    </div>
  );
};

export default DaySelector;