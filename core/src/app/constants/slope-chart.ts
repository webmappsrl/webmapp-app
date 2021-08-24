import { ISlopeChartStyle } from '../types/slope-chart';
import { ESlopeChartSurface } from '../types/eslope-chart.enum';

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
