// import { getIntl, setLocale } from '@umijs/max';
// import { MessageDescriptor } from 'react-intl';

import i18n from '@/app/i18n';

/**
 * 适配原生接口
 * @param descriptor
 * @param values
 */
export function localeIntl(descriptor: any, values?: Record<string, any>) {
  return i18n.t(descriptor.id, values);
  // return getIntl().formatMessage(descriptor, values);
}

/**
 * 适配原生接口包含html
 * @param descriptor
 * @param values
 */
export function localeHtmlIntl(descriptor: any, values?: Record<string, any>) {
  return i18n.t(descriptor.id, values);
  // return getIntl().formatHTMLMessage(descriptor, values);
}

/**
 * 根据id获取文本
 * @param id
 * @param values
 */
export function localeMsg(id: string, values?: Record<string, any>) {
  return i18n.t(id, values || {});
  // return localeIntl({ id }, values);
}

/**
 * 根据id获取包含html内容的文本
 * @param id
 * @param values
 */
export function localeHtmlMsg(id: string, values?: Record<string, any>) {
  return i18n.t(id, values || {});
  // return localeHtmlIntl({ id }, values);
}

// /**
//  * 获取当前国际化类型
//  */
// export function getCurrentLocale() {
//   const localeInfo = getIntl();
//   return localeInfo.locale;
// }
//
// /**
//  * 设置默认国际化语言
//  */
// export function setCurrentLocale() {
//   setLocale('zh-CN');
// }
