import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { HourlyData, TimeRange } from '../types';
import { formatTime, formatTemperature } from '../utils/helpers';

interface WeatherChartProps {
  hourlyData: HourlyData[];
  selectedTimeRange: TimeRange;
  weekType: 'current' | 'next';
}

interface ChartDataPoint {
  hour: string;
  hourNumeric: number;
  temperature: number;
  precipProbability: number;
  windSpeed: number;
}

/**
 * WeatherChart component leveraging Recharts for comprehensive weather visualization
 * Implements dual-axis design to accommodate different metric scales
 * Provides interactive tooltips and responsive sizing for optimal display
 */
const WeatherChart: React.FC<WeatherChartProps> = ({
  hourlyData,
  selectedTimeRange,
  weekType
}) => {
  /**
   * Transform hourly data for the selected time range into chart-compatible format
   * Filters data to only include hours within the user-selected time range
   */
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return hourlyData
      .filter(hour => hour.hour >= selectedTimeRange.start && hour.hour <= selectedTimeRange.end)
      .map(hour => ({
        hour: formatTime(hour.hour),
        hourNumeric: hour.hour,
        temperature: hour.temperature,
        precipProbability: hour.precipProbability,
        windSpeed: hour.windSpeed
      }));
  }, [hourlyData, selectedTimeRange]);

  /**
   * Custom tooltip component providing formatted values for all metrics
   * Enhances user experience with clear, contextualized data presentation
   */
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {
                entry.dataKey === 'temperature' 
                  ? formatTemperature(entry.value)
                  : entry.dataKey === 'precipProbability'
                  ? `${entry.value}%`
                  : `${entry.value} mph`
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /**
   * Calculate domain ranges for axes to ensure optimal data visualization
   * Temperature gets its own axis due to different scale requirements
   */
  const temperatureDomain = useMemo(() => {
    const temps = chartData.map(d => d.temperature);
    const min = Math.min(...temps) - 5;
    const max = Math.max(...temps) + 5;
    return [Math.floor(min / 5) * 5, Math.ceil(max / 5) * 5];
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="weather-chart-empty">
        <p>No data available for the selected time range</p>
      </div>
    );
  }

  return (
    <div className="weather-chart-container">
      <h4 className="chart-title">
        {weekType === 'current' ? 'This Week' : 'Next Week'} - {selectedTimeRange.label}
      </h4>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="hour"
            tick={{ fontSize: 12 }}
            tickMargin={8}
          />
          
          {/* Primary Y-axis for precipitation and wind speed */}
          <YAxis 
            yAxisId="left"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            label={{ 
              value: 'Precipitation % / Wind Speed mph', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, textAnchor: 'middle' }
            }}
          />
          
          {/* Secondary Y-axis for temperature */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={temperatureDomain}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            label={{ 
              value: 'Temperature (°F)', 
              angle: 90, 
              position: 'insideRight',
              style: { fontSize: 12, textAnchor: 'middle' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />

          
          
          <Legend 
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
            iconType="line"
          />
          
           {/* Area fill for precipitation probability */}
           <Area
            yAxisId="left"
            activeDot={{ r: 5 }}
            dot={{ r: 3, fill: '#fff', fillOpacity: 1 }}
            type="monotone"
            dataKey="precipProbability"
            fill="#2196F3"
            fillOpacity={0.1}
            stroke="#2196F3"
            name="Precipitation Chance"
            strokeWidth={2}
          />
         
          
          {/* Wind speed line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="windSpeed"
            stroke="#4CAF50"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Wind Speed"
          />
          
          {/* Temperature line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="temperature"
            stroke="#FF5722"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Temperature"
          />
          
          {/* Reference lines for weather thresholds */}
          <ReferenceLine 
            yAxisId="left" 
            y={60} 
            stroke="#2196F3" 
            strokeDasharray="5 5" 
            opacity={0.5}
          />
          <ReferenceLine 
            yAxisId="left" 
            y={20} 
            stroke="#4CAF50" 
            strokeDasharray="5 5" 
            opacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherChart;