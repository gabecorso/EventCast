import React, { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useWeather } from '../context/WeatherContext';
import config from '../config/config';
import { TimeRange } from '../types';

/**
 * TimeRangeSelector component implementing temporal filtering for weather analysis
 * Enables selection of specific time periods for targeted meteorological assessment
 * Provides preset time ranges optimized for common outdoor meetup scheduling patterns
 */
const TimeRangeSelector: React.FC = () => {
  const { selectedTimeRange, handleTimeRangeChange } = useWeather();

  /**
   * Process selection change events with proper type handling
   * Retrieves time range configuration based on selected index
   * @param event - React change event from select element
   */
  const handleChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedIndex = parseInt(event.target.value, 10);
    if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < config.DEFAULT_TIME_RANGES.length) {
      const newTimeRange: TimeRange = config.DEFAULT_TIME_RANGES[selectedIndex];
      handleTimeRangeChange(newTimeRange);
    }
  };

  /**
   * Determine current selection index for controlled component synchronization
   * Ensures select element displays accurate current selection state
   * @returns Index of currently selected time range within configuration array
   */
  const getCurrentSelectedIndex = (): number => {
    const index = config.DEFAULT_TIME_RANGES.findIndex(
      range => range.label === selectedTimeRange.label
    );
    return index !== -1 ? index : 0;
  };

  return (
    <div className="time-range-selector" role="group" aria-labelledby="time-range-label">
      <label 
        id="time-range-label" 
        htmlFor="time-range-select" 
        className="time-range-label"
      >
        <FontAwesomeIcon 
          icon={['fas', 'clock'] as IconProp} 
          className="label-icon" 
          aria-hidden="true"
        />
        <span>Time Range</span>
      </label>
      <select
        id="time-range-select"
        value={getCurrentSelectedIndex()}
        onChange={handleChange}
        className="time-range-dropdown"
        aria-label="Select meetup time range"
        aria-describedby="time-range-info"
      >
        {config.DEFAULT_TIME_RANGES.map((range, index) => (
          <option key={`time-range-${index}`} value={index}>
            {range.label}
          </option>
        ))}
      </select>
      <div id="time-range-info" className="time-range-info">
        <p className="info-text">
          Weather conditions will be averaged for the selected hours to provide 
          representative data for your planned meetup timeframe
        </p>
      </div>
    </div>
  );
};

export default TimeRangeSelector;