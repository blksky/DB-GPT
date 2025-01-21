import dayjs from 'dayjs';
import PluginDuration from 'dayjs/plugin/duration';
import PluginIsBetween from 'dayjs/plugin/isBetween';

dayjs.extend(PluginDuration);
dayjs.extend(PluginIsBetween);

export const HMS = 'HH:mm:ss';

export const YMD = 'YYYY-MM-DD';

export const YMD_B = 'YYYY/MM/DD';

export const YMD_HM = 'YYYY-MM-DD HH:mm';

export const YMD_HMS = 'YYYY-MM-DD HH:mm:ss';

export const YMD_HMS_S = 'YYYY-MM-DD HH:mm:ss.SSS';

export const YMD_B_HMS = 'YYYY/MM/DD HH:mm:ss';

export const YMD_MIN = 'YYYY-MM-DD 00:00:00';

export const YMD_B_MIN = 'YYYY/MM/DD 00:00:00';

export const YMD_MAX = 'YYYY-MM-DD 23:59:59';

export const YMD_B_MAX = 'YYYY/MM/DD 23:59:59';

function isString(o: any) {
  return Object.prototype.toString.call(o) === '[object String]';
}

/**
 * 获取时间对象
 * @param value
 * @param format
 */
export function getMoment(value?: any, format?: string): dayjs.Dayjs {
  if (format) {
    if (value === undefined || value === null) {
      return dayjs(new Date(), format);
    }
    return dayjs(value, format);
  }
  if (value === undefined || value === null) {
    return dayjs();
  }
  return dayjs(value);
}

/**
 * 获取指定格式的时间
 * @param value
 * @param format
 * @returns {string}
 */
export function getDateFormat(value: any, format: string) {
  return getMoment(value).format(format);
}

/**
 * 时间转换为 YMD-HMS格式
 * @param value
 * @returns {string}
 */
export function getDateYmdHms(value: any) {
  return getDateFormat(value, YMD_HMS);
}

/**
 * 时间转换为 YMD-HMS_S格式，精确到毫秒
 * @param value
 * @returns {string}
 */
export function getDateYmdHmsS(value: any) {
  return getDateFormat(value, YMD_HMS_S);
}

/**
 * 时间转换为 HMS格式
 * @param value
 * @returns {string}
 */
export function getDateHms(value: any) {
  return getDateFormat(value, HMS);
}

/**
 * 时间转换为 YMD格式
 * @param value
 * @returns {string}
 */
export function getDateYmd(value: any) {
  return getDateFormat(value, YMD);
}

/**
 * 时间转换为 YMD-000格式
 * @param value
 * @returns {string}
 */
export function getDateYmdMin(value: any) {
  return getDateFormat(value, YMD_MIN);
}

/**
 * 时间转换为 YMD-999格式
 * @param value
 * @returns {string}
 */
export function getDateYmdMax(value: any) {
  return getDateFormat(value, YMD_MAX);
}

/**
 * 时间转换为 YMD-HMS格式
 * @param value
 * @returns {string}
 */
export function getDateYmdHmsB(value: any) {
  return getDateFormat(value, YMD_B_HMS);
}

/**
 * 时间转换为 YMD格式
 * @param value
 * @returns {string}
 */
export function getDateYmdB(value: any) {
  return getDateFormat(value, YMD_B);
}

/**
 * 时间转换为 YMD-000格式
 * @param value
 * @returns {string}
 */
export function getDateYmdMinB(value: any) {
  return getDateFormat(value, YMD_B_MIN);
}

/**
 * 时间转换为 YMD-999格式
 * @param value
 * @returns {string}
 */
export function getDateYmdMaxB(value: any) {
  return getDateFormat(value, YMD_B_MAX);
}

/**
 * 在日期的基础是添加时间
 * @param mom
 * @param value
 * @param unit
 * @returns {*}
 */
export function addMoment(mom: any, value: number, unit: any) {
  return getMoment(mom).add(value, unit);
}

/**
 * 减去时间
 * @param mom
 * @param value
 * @param unit
 */
export function subMoment(mom: any, value: number, unit: any) {
  return getMoment(mom).subtract(value, unit);
}

/**
 * 获取长整形时间
 * @param mom
 * @returns {number}
 */
export function getMomentLong(mom: any) {
  return +getMoment(mom);
}

/**
 * 将unix timestamp转换为YMD_HMS
 * @param value
 * @returns {string}
 */
export function getUnixLongYmdHms(value: any) {
  const isNull = value === undefined || value === null;
  const mom = isNull ? dayjs() : dayjs(value * 1000);
  return mom.format(YMD_HMS);
}

/**
 * 获取日期类型的longTime
 * @param value
 * @returns {number|*}
 */
export function getDateLongValue(value: any) {
  if (!value) return value;
  if (isString(value) || value.toString().length <= 13) {
    if (isString(value) && /^[1-9]\d*$/.test(value)) {
      return Number(value);
    }
    return getMomentLong(value);
  }
  return 0;
}

/**
 * 比较是否在之后
 * @param mom
 * @param momOther
 * @returns {boolean}
 */
export function isAfter(mom: any, momOther: any) {
  return getMoment(mom).isAfter(getMoment(momOther));
}

/**
 * 比较是否在之前
 * @param mom
 * @param momOther
 * @returns {boolean}
 */
export function isBefore(mom: any, momOther: any) {
  return getMoment(mom).isBefore(getMoment(momOther));
}

/**
 * 获取时间差
 * @param mom
 * @param momOther
 * @returns {number}
 */
export function diff(mom: any, momOther: any) {
  return getMoment(mom).diff(getMoment(momOther));
}

/**
 * 获取距当前时间差
 * @param mom
 * @returns {string}
 */
export function fromNow(mom: any) {
  return dayjs.duration(getMoment().diff(getMoment(mom)));
}

/**
 * 获取是否在区间中
 * @param mom
 * @param momA
 * @param momB
 * @returns {boolean}
 */
export function isBetween(mom: any, momA: any, momB: any) {
  return getMoment(mom).isBetween(getMoment(momA), getMoment(momB));
}

/**
 * 获取最近一个月
 */
export function getLastMonth() {
  const today = getDateYmd(new Date());
  return [subMoment(getMoment(today, YMD), 1, 'M'), getMoment(today, YMD)];
}
