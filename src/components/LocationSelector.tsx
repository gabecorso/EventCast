import React, { useState, useCallback, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useWeather } from '../context/WeatherContext';
import { debounce } from '../utils/helpers';

/**
 * LocationSelector component implementing geographic location search functionality
 * Provides debounced search input with validation and visual feedback mechanisms
 * Ensures optimal API usage through intelligent request throttling and caching strategies
 */
const LocationSelector: React.FC = () => {
  const { location, handleLocationChange } = useWeather();
  const [searchValue, setSearchValue] = useState<string>(location);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(true);

  /**
   * Create debounced location update function to prevent excessive API calls
   * Implements 800ms delay to allow users to complete typing before triggering search
   */
  const debouncedLocationUpdate = useCallback(
    debounce((value: string): void => {
      if (value.trim().length > 2) {
        setIsSearching(true);
        handleLocationChange(value);
        // Reset searching state after sufficient delay for visual feedback
        setTimeout(() => setIsSearching(false), 1000);
      } else {
        setIsValid(false);
      }
    }, 800),
    [handleLocationChange]
  );

  /**
   * Handle input change events with validation and debounced updates
   * @param event - React change event from input element
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchValue(value);
    setIsValid(true);
    
    if (value.trim().length > 2) {
      debouncedLocationUpdate(value);
    } else if (value.trim().length === 0) {
      setIsValid(false);
    }
  };

  /**
   * Handle keyboard events for immediate search on Enter key press
   * @param event - React keyboard event from input element
   */
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && searchValue.trim().length > 2) {
      event.preventDefault();
      handleLocationChange(searchValue);
    }
  };

  /**
   * Clear search input and reset validation state
   */
  const handleClear = (): void => {
    setSearchValue('');
    setIsValid(false);
  };

  /**
   * Synchronize local state with context location on mount and updates
   */
  useEffect(() => {
    setSearchValue(location);
  }, [location]);

  return (
    <div className="location-selector">
      <label htmlFor="location-input" className="visually-hidden">
        Search for a location
      </label>
      <div className="location-input-wrapper">
        <FontAwesomeIcon 
          icon={['fas', 'map-marker-alt'] as IconProp} 
          className="location-icon" 
          aria-hidden="true"
        />
        <input
          id="location-input"
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyUp={handleKeyPress}
          placeholder="Enter city, state or zip code"
          className={`location-input ${!isValid ? 'invalid' : ''}`}
          aria-label="Location search"
          aria-describedby="location-helper"
          aria-invalid={!isValid}
          autoComplete="off"
          spellCheck={false}
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="clear-button"
            aria-label="Clear location search"
            type="button"
          >
            <FontAwesomeIcon icon={['fas', 'times'] as IconProp} />
          </button>
        )}
        {isSearching && (
          <div className="search-indicator" aria-hidden="true">
            <FontAwesomeIcon icon={['fas', 'spinner'] as IconProp} spin />
          </div>
        )}
      </div>
      {!isValid && (
        <p 
          id="location-helper" 
          className="location-helper-text error" 
          role="alert"
        >
          Please enter at least 3 characters to search for a location
        </p>
      )}
    </div>
  );
};

export default LocationSelector;