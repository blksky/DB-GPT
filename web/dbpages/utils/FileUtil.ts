/**
 * 返回每三位加一个逗号的数值string
 * @param num
 */
export function getNumberString(num = 0): string {
  return Number(num).toLocaleString();
}

/**
 * 获取文件详情参数
 * @param record
 */
export function getFileDetailParam(record: any): string {
  return record?.docCode;
}

/**
 * 获取文档预览url
 * @param record
 */
export function getFileViewPageUrl(record?: any): string {
  if (!record) return '';

  const docCode = encodeURIComponent(record.docCode);
  const docName = encodeURIComponent(record.docRealName || record.docName);
  const hasSourceSystem = record.sourceSystem !== null && record.sourceSystem !== undefined;
  const sourceSystem = hasSourceSystem ? `&sourceSystem=${record.sourceSystem}` : '';
  return `file?docCode=${docCode}&docName=${docName}${sourceSystem}`;
}

/**
 * 获取文件后缀
 * @param fileName
 */
export function getFileExt(fileName?: string): string {
  if (!fileName) return '';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > -1 ? fileName.substring(dotIndex + 1).toLowerCase() : '';
}

/**
 * 获取不含后缀的文件民
 * @param fileName
 */
export function getFileNameNoExt(fileName?: string): string {
  if (!fileName) return '';
  return fileName.substring(0, fileName.lastIndexOf('.'));
}

/**
 * 字节数转文件大小
 * @param bytes
 */
export function getFileSizeString(bytes?: number): string {
  if (!bytes) return '0B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const index = Math.floor(Math.log(bytes) / Math.log(k));
  const i = index === -1 ? 0 : index;
  return getNumberString(Number((bytes / Math.pow(k, i)).toPrecision(3))) + sizes[i];
}
