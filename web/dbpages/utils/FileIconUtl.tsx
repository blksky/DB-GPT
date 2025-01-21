import ICON_TXT from '@/dbpages/images/file/icons_doc.png';
import ICON_IMG from '@/dbpages/images/file/icons_IMG.png';
import ICON_UNKNOWN from '@/dbpages/images/file/icons_Unknown.png';
import ICON_VIDEO from '@/dbpages/images/file/icons_Video.png';
import ICON_ZIP from '@/dbpages/images/file/icons_zip.png';

import ICON_DOC from '@/dbpages/images/kgSpace/icons_doc.svg';
import ICON_DOCX from '@/dbpages/images/kgSpace/icons_docx.svg';
import ICON_FOLDER from '@/dbpages/images/kgSpace/icons_folder.svg';
import ICON_PDF from '@/dbpages/images/kgSpace/icons_pdf.svg';
import ICON_PPT from '@/dbpages/images/kgSpace/icons_ppt.svg';
import ICON_PPTX from '@/dbpages/images/kgSpace/icons_pptx.svg';
import ICON_XLS from '@/dbpages/images/kgSpace/icons_xls.svg';
import ICON_XLSX from '@/dbpages/images/kgSpace/icons_xlsx.svg';

import {getFileExt} from './FileUtil';

/**
 * 文件或目录信息
 */
export interface IFileIconData {
  docName?: string;

  [key: string]: any;
}

function getExtList(str: string): string[] {
  return str
    .split(',')
    .map(d => d.trim())
    .filter(d => !!d);
}

export const IMG_FILES = getExtList('jpg, jpeg, png, gif, bmp, ico, jfif, webp, svg');
export const VIDEO_FILES = getExtList('mp3,wav,mp4,flv, avi, mov, wmv, mkv, 3gp, and rm');
export const OBJ_3D_FILES = getExtList(
  'obj, 3ds, stl, ply, gltf, glb, off, 3dm, fbx, dae, wrl, 3mf, ifc, brep, step, iges, fcstd, bim',
);
export const CAD_FILES = getExtList('dwg, dxf, dwf');
export const DOC_FILES = getExtList('drawio, epub, eml, xmind, txt, xml , md , java, php, py, js, css');
export const VSO_FILES = getExtList('vsd, vsdx');

export const ZIP_FILES = getExtList('zip, rar, jar, 7z, gz, bz, tar, gzip');

/**
 * 获取文件夹图标
 * @param className
 */
export function getFolderIcon(className: string = 'table-item-icon') {
  return <img alt='' className={className} src={ICON_FOLDER} />;
}

/**
 * 获取文件图标
 * @param fileName
 * @param className
 */
export function getFileIcon(fileName: string, className: string): any {
  const fileExt = getFileExt(fileName);
  if (fileExt === 'pdf') {
    return <img alt='' className={className} src={ICON_PDF} />;
  }
  if (fileExt === 'xls') {
    return <img alt='' className={className} src={ICON_XLS} />;
  }
  if (fileExt === 'xlsx' || fileExt === 'xlsm') {
    return <img alt='' className={className} src={ICON_XLSX} />;
  }
  if (fileExt === 'ppt') {
    return <img alt='' className={className} src={ICON_PPT} />;
  }
  if (fileExt === 'pptx') {
    return <img alt='' className={className} src={ICON_PPTX} />;
  }
  if (fileExt === 'doc') {
    return <img alt='' className={className} src={ICON_DOC} />;
  }
  if (fileExt === 'docx') {
    return <img alt='' className={className} src={ICON_DOCX} />;
  }

  if (ZIP_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_ZIP} />;
  }
  if (VIDEO_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_IMG} />;
  }
  if (IMG_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_VIDEO} />;
  }
  if (CAD_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_UNKNOWN} />;
  }
  if (OBJ_3D_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_UNKNOWN} />;
  }
  if (DOC_FILES.includes(fileExt) || VSO_FILES.includes(fileExt)) {
    return <img alt='' className={className} src={ICON_TXT} />;
  }
  if (fileExt.length > 0) {
    return <img alt='' className={className} src={ICON_UNKNOWN} />;
  }
  return undefined;
}

/**
 * 获取表格中的文件图标
 * @param data
 * @param className
 */
export function getTableFileIcon(data?: IFileIconData, className: string = 'table-item-icon'): any {
  if (!data?.docName) {
    return getFolderIcon(className);
  }
  let fileIcon = getFileIcon(data.docName, className);
  if (!fileIcon) {
    fileIcon = <img alt='' className={className} src={ICON_TXT} />;
  }
  return fileIcon;
}
