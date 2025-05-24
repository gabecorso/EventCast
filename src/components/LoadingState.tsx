import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * LoadingState component implementing visual feedback during data retrieval operations
 * Provides animated weather-themed loading indicators combined with skeleton screens
 * Enhances perceived performance through progressive content revelation patterns
 */
const LoadingState: React.FC = () => {
  /**
   * Generate skeleton placeholder elements for visual continuity
   * @param count - Number of skeleton elements to generate
   * @returns Array of skeleton day elements
   */
  const renderSkeletonDays = (count: number): React.ReactNode[] => {
    return Array.from({ length: count }, (_, index) => (
      <div key={index} className="skeleton-day" aria-hidden="true">
        <div className="skeleton-day-header"></div>
        <div className="skeleton-day-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-content">
        <div className="loading-animation" aria-hidden="true">
          <FontAwesomeIcon 
            icon={['fas', 'cloud-sun'] as IconProp} 
            className="loading-icon primary" 
            size="3x"
          />
          <FontAwesomeIcon 
            icon={['fas', 'cloud'] as IconProp} 
            className="loading-icon secondary" 
            size="2x"
          />
          <FontAwesomeIcon 
            icon={['fas', 'cloud-rain'] as IconProp} 
            className="loading-icon tertiary" 
            size="2x"
          />
        </div>
        
        <h2 className="loading-title">Retrieving Weather Data</h2>
        <p className="loading-message">
          Please wait while we fetch the latest weather information for your location.
          This process typically completes within a few seconds.
        </p>
      </div>
      
      <div className="skeleton-container" aria-hidden="true">
        <div className="skeleton-week">
          <div className="skeleton-header"></div>
          {renderSkeletonDays(3)}
        </div>
        
        <div className="skeleton-week">
          <div className="skeleton-header"></div>
          {renderSkeletonDays(3)}
        </div>
      </div>
      
      {/* Screen reader announcement for accessibility compliance */}
      <span className="visually-hidden">
        Loading weather data. Please wait.
      </span>
    </div>
  );
};

export default LoadingState;