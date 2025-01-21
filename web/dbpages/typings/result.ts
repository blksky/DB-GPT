import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { message, notification } from 'antd';

message.config({ maxCount: 1 });
notification.config({ maxCount: 1 });

export enum EnumResultCode {
  /** 成功 */
  SUCCESS = 0,
  /** 失败 */
  ERROR = 1,
}

/**
 * 结果格式
 */
export interface IApiResult<T = any> {
  code: number;
  content: T;
  message?: string;
}

export interface IApiPageResult<T = any> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

export const OPERATE_TYPES: Record<string, string> = {
  DEL: 'operate.del',
  REDO: 'operate.redo',
  ADD: 'operate.add',
  APPEND: 'operate.append',
  EDIT: 'operate.edit',
  SAVE: 'operate.save',
  RESET: 'operate.reset',
  SETTING: 'operate.setting',
  QUERY: 'operate.query',
  OPERATE: 'operate',
  APPLY: 'operate.apply',
  APPROVAL: 'operate.approval',
  PUBLISH: 'operate.publish',
  UPLOAD: 'operate.upload',
  IMPORT: 'operate.import',
  CLONE: 'operate.clone',
  RESTORE: 'operate.restore',
  DOWNLOAD: 'operate.download',
  REMOVE: 'operate.remove',
  RECOKED: 'operate.undo',
  MODIFY: 'operate.modify',
  SHARE: 'operate.share',
};

const OPERATE_VALUES = Object.values(OPERATE_TYPES);

const NO_SUC_MSG = [OPERATE_TYPES.QUERY];

function getOperateType(operate: string) {
  if (OPERATE_VALUES.includes(operate)) {
    return localeMsg(operate);
  }
  return operate;
}

/**
 * 结果处理参数
 */
export interface IResultWrapperProps<T> {
  data: IApiResult<T> | any;
  onSuccess?: (content: T) => void;
  onError?: (data: any) => void;
  operate?: string;
  sucMsg?: boolean;
  errMsg?: boolean;
  condition?: boolean;
}

/**
 * 显示成功提示
 * @param options
 */
export function showSuccessToast(options: { content: string }) {
  message.warning(options.content);
}

/**
 * 显示警告提示
 * @param options
 */
export function showWarningToast(options: { content: string }) {
  message.warning(options.content);
}

/**
 * 显示失败提示
 * @param options
 */
export function showErrorToast(options: { content: string }) {
  message.error(options.content);
}

/**
 * 显示成功信息
 * @param options
 */
export function showSiteSuccess(options: { description: string }) {
  message.success(options.description);
}

/**
 * 显示警告信息
 * @param options
 */
export function showSiteInfo(options: { message?: any; description: any }) {
  notification.info({
    placement: 'topRight',
    message: options.message || localeMsg('operate.msg'),
    description: options.description,
  });
}

/**
 * 显示警告信息
 * @param options
 */
export function showSiteWarning(options: { message?: any; description: any }) {
  notification.warning({
    placement: 'topRight',
    message: options.message || localeMsg('operate.warning'),
    description: options.description,
  });
}

/**
 * 显示错误信息
 * @param options
 */
export function showSiteError(options: { message?: string; description: string }) {
  if (options.description === '查询失败：登录失效，请重新登录!') {
    showSiteInfo({ description: localeMsg('pages.error.loginExpired') });
    return;
  }
  notification.error({
    placement: 'topRight',
    message: options.message || localeMsg('operate.error'),
    description: options.description,
  });
}

/**
 * 查询结果处理
 * @param props
 * @constructor
 */
export function ResultWrapper<T = any>(props: IResultWrapperProps<T>) {
  const { data, onSuccess, onError, errMsg, condition = true } = props;
  let result = false;
  let { sucMsg, operate = OPERATE_TYPES.QUERY } = props;
  const defaultNoSucMsg = NO_SUC_MSG.includes(operate);
  if (sucMsg !== true && defaultNoSucMsg) {
    sucMsg = false;
  }
  operate = getOperateType(operate);
  if (data?.code === EnumResultCode.SUCCESS && condition) {
    result = true;
    onSuccess?.(data.content);
    if (sucMsg !== false) {
      console.log(111);
      showSiteSuccess({ description: localeMsg('operate.msg.suc', { name: operate }) });
    }
  } else if (!data || data.code === EnumResultCode.ERROR) {
    onError?.(data);
    if (errMsg !== false && data?.message) {
      showSiteError({
        description: localeMsg('operate.msg.err', { name: operate, err: data.message }),
      });
    }
  }
  return result;
}
