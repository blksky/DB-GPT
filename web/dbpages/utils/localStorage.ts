import { DEFAULT_LANG, DEFAULT_THEME, DEFAULT_THEME_COLOR } from '@/dbpages/common/constants';
import { LangType, PrimaryColorType, ThemeType } from '../constants';

export function getLang(): LangType {
  if (typeof localStorage === 'undefined') return DEFAULT_LANG;
  return (localStorage.getItem('lang') as LangType) || DEFAULT_LANG;
}

export function setLang(lang: LangType) {
  if (typeof localStorage === 'undefined') return;
  return localStorage.setItem('lang', lang);
}

export function getTheme(): ThemeType {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME;
  const themeColor: any = localStorage.getItem('theme') as ThemeType;
  if (themeColor) {
    return themeColor;
  }
  localStorage.setItem('theme', DEFAULT_THEME);
  // 默认主题色
  return DEFAULT_THEME;
}

export function setTheme(theme: ThemeType) {
  if (typeof localStorage === 'undefined') return;
  return localStorage.setItem('theme', theme);
}

export function getPrimaryColor(): PrimaryColorType {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME_COLOR;
  const primaryColor = localStorage.getItem('primary-color') as PrimaryColorType;
  if (primaryColor) {
    return primaryColor;
  }
  localStorage.setItem('primary-color', DEFAULT_THEME_COLOR);
  // 默认主题色
  return DEFAULT_THEME_COLOR;
}

export function setPrimaryColor(primaryColor: PrimaryColorType) {
  if (typeof localStorage === 'undefined') return;
  return localStorage.setItem('primary-color', primaryColor);
}

export function setCurrentWorkspaceDatabase(value: any) {
  if (typeof localStorage === 'undefined') return;
  return localStorage.setItem(`current-workspace-database`, JSON.stringify(value));
}

export function getCurrentWorkspaceDatabase(): any {
  if (typeof localStorage === 'undefined') return {};
  const curWorkspaceParams = localStorage.getItem(`current-workspace-database`);

  if (curWorkspaceParams) {
    return JSON.parse(curWorkspaceParams);
  }
  return {};
}

export function getCurConnection() {
  if (typeof localStorage === 'undefined') return undefined;
  const curConnection = localStorage.getItem(`cur-connection`);
  if (curConnection) {
    return JSON.parse(curConnection || '{}');
  }
  return undefined;
}
