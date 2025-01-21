import { format } from 'sql-formatter';

export enum EnumResultShowType {
  TABLE = 'TABLE',
  LINE_CHART = 'line',
  AREA_CHART = 'area',
  PIE_CHART = 'pie',
  DOT_CHART = 'scatter',
  BAR_CHART = 'bar',
  RADAR_CHART = 'radar',
}

export const DEFAULT_CHART_HEIGHT = 200;

export const CHART_SECONDARY_COLOR = 'rgba(153, 153, 153, 0.3)';

export const THEME_COLOR_LIST = [
  '#3369FF',
  '#36D2B8',
  '#DB8D76',
  '#47B359',
  '#8545E6',
  '#E0B18B',
  '#7258F3',
  '#0095FF',
  '#52CC8F',
  '#6675FF',
  '#CC516E',
  '#5CA9E6',
];

/**
 * 格式化SQL
 * @param strSql
 */
export function getFormatedSql(strSql?: string) {
  if (!strSql) return '';
  let result = strSql;
  try {
    result = format(strSql);
  } catch (e) {}
  return result;
}
