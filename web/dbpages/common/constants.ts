import { getCookie } from '@/dbpages/utils';
import { LangType, PrimaryColorType, ThemeType } from '../constants';

export const AUTH_TOKEN_KEY = process.env.APP_TARGET === 'inner' ? 'TME_TOKEN' : 'SUPERSONIC_TOKEN';

/**  登录url */
export const LOGIN_PATH = '/login';
/**  登录回调参数 */
export const LOGIN_PARAM_RETURN = 'returnUrl';

/** 默认分页页码 */
export const DEFAULT_PAGE_INDEX = 1;

/** 默认分页每页数量 */
export const DEFAULT_PAGE_SIZE = 10;

/** 获取当前登录用户ID */
export function getLoginUserId() {
  return getCookie('CHAT2DB.USER_ID');
}

/** 默认语言 */
export const DEFAULT_LANG = LangType.ZH_CN;
/** 默认主题 */
export const DEFAULT_THEME = ThemeType.Light;
/** 默认主题色 */
export const DEFAULT_THEME_COLOR = PrimaryColorType.Polar_Blue;

export enum NumericUnit {
  None = '无',
  TenThousand = '万',
  EnTenThousand = 'w',
  OneHundredMillion = '亿',
  Thousand = 'k',
  Million = 'M',
  Giga = 'G',
}
