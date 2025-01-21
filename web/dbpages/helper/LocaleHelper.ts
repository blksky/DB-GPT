import i18n from '@/dbpages/i18n';

/**
 * 根据id获取文本
 * @param id
 * @param values
 */
export function localeMsg(id: string, values?: Record<string, any>) {
  return i18n(id as any, ...Object.values(values || {}));
}

/**
 * 根据id获取包含html内容的文本
 * @param id
 * @param values
 */
export function localeHtmlMsg(id: string, values?: Record<string, any>) {
  return i18n(id as any, ...Object.values(values || {}));
}
