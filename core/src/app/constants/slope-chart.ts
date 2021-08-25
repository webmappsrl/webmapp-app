import { ISlopeChartStyle } from '../types/slope-chart';
import { ESlopeChartSurface } from '../types/eslope-chart.enum';

export const SLOPE_CHART_SLOPE_EASY: [number, number, number] = [67, 227, 9];
export const SLOPE_CHART_SLOPE_MEDIUM_EASY: [number, number, number] = [
  195, 255, 0,
];
export const SLOPE_CHART_SLOPE_MEDIUM: [number, number, number] = [
  255, 239, 10,
];
export const SLOPE_CHART_SLOPE_MEDIUM_HARD: [number, number, number] = [
  255, 174, 0,
];
export const SLOPE_CHART_SLOPE_HARD: [number, number, number] = [196, 30, 4];

export const SLOPE_CHART_SURFACE: {
  [id in ESlopeChartSurface]: ISlopeChartStyle;
} = {
  [ESlopeChartSurface.ASPHALT]: {
    backgroundColor: 'rgba(55, 52, 60, 1)',
  },
  [ESlopeChartSurface.CONCRETE]: {
    backgroundColor: 'rgba(134, 130, 140, 1)',
  },
  [ESlopeChartSurface.DIRT]: {
    backgroundColor: 'rgba(125, 84, 62, 1)',
  },
  [ESlopeChartSurface.GRASS]: {
    backgroundColor: 'rgba(143, 176, 85, 1)',
  },
  [ESlopeChartSurface.GRAVEL]: {
    backgroundColor: 'rgba(5, 56, 85, 1)',
  },
  [ESlopeChartSurface.PAVED]: {
    backgroundColor: 'rgba(116, 140, 172, 1)',
  },
  [ESlopeChartSurface.SAND]: {
    backgroundColor: 'rgba(245, 213, 56, 1)',
  },
};
