import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { message, notification } from 'antd';
import type { PaginationConfig } from 'antd/es/pagination/Pagination';
import type {ApiResponse} from '@/client/api'

/** 查询类型，是查询还是加载更多 */
export enum EnumSearchActionType {
  SEARCH,
  LOAD_MORE,
  PAGE_CHANGE,
}

export interface IApiPageResult<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

/** 全文检索元数据*/
export interface ISearchExtraMeta {
  /** 文档类型 */
  docFormat: Record<string, string>;
  /** 部门列表 */
  deptLv1Abbr: Record<string, string>;
  businessCategories: Record<string, string>;
  businessSystem: Record<string, string>;
  businessScope: Record<string, string>;
  tags: Record<string, string>;
}

export interface ITagsData {
  value: number;
  name: string;
}

export interface ISearchSelectData {
  id: number;
  value: number;
  name: string;
  children: ISearchSelectData[];
  parentDicCode: number;
}

/**
 * 最简文档信息
 */
export interface IBaseSampleFile {
  docId: number;
  docName: string;
  docCode: string;
  docRealName?: string;
  [key: string]: any;
}

/**
 * 包含文档id和摘要
 */
export interface IBaseFile extends IBaseSampleFile {
  docAbs?: string;
  docText?: string;
  /** 业务分类ID */
  businessCateId?: number;
  /** 业务分类名称 */
  businessCateName?: string;
  /** 业务体系id */
  businessSystemId?: number;
  /** 业务体系名称 */
  businessSystemName?: string;
  /** 匹配度评分 */
  score?: number;
}

/**
 * 包含交互信息的文档信息
 */
export interface IBaseActionFile extends IBaseFile {
  likeCount: number;
  collectCount: number;
  downloadCount: number;
  shareCount: number;
  viewCount: number;
}

/**
 * 全文检索结果类型
 */
export interface ISearchData extends IBaseActionFile {
  highLightMap: Record<string, any>;
}

/** 最简分页条件 */
export interface IPageSampleCondition {
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
  [key: string]: any;
}

/**
 * 全文检索条件
 */
export interface ISearchCondition extends IPageSampleCondition {
  searchType?: string | any;
  values?: Record<string, any>;
}

/**
 * 首页、搜索页TAB标签数据
 */
export interface IMainTypeData {
  id: number;
  name: string;
}

/**
 * 文档分类信息
 */
export interface IDocClassificationInfo {
  docExtraFieldValueId: any;
  docExtraFieldValue: any;
  id: number;
}

/** 简单分页数据 */
export interface IPageSampleData<T> {
  loading: boolean;
  keyword?: string;
  time?: number;
  list: T[];
  pagination: PaginationConfig;
  actionType?: EnumSearchActionType;
  pageIndex?: number;
  pageSize?: number;
}

export interface IDocumentData {
  id: number;
  doc_name: string;
  doc_type: string;
  content: string;
  vector_ids: string;
  space: string;
  space_id?: number;
  status: string;
  last_sync: string;
  result: string;
  summary: string;
  gmt_created: string;
  gmt_modified: string;
  chunk_size: number;
  questions: any | null; 
}

export interface IDbGptApiData<T> {
  data: T;
  err_code: any;
  err_msg: any;
  success: boolean;
}

export interface IDbGptApiPageData<T> {
  data: T[]
  page: number;
  page_size?: number;
  total: number;
}

/**
 * 根据查询类型获取分页信息
 * @param payload
 * @param actionType
 * @param currentList
 * @param defaultPageSize
 * @param defaultPageStep
 */
export function getPagerByActionType(
  payload: IPageSampleCondition,
  actionType: EnumSearchActionType,
  currentList: any[],
  defaultPageSize?: number,
  defaultPageStep?: number,
): {
  pageIndex: number;
  pageSize: number;
  isSearch: boolean;
  isLoadMore: boolean;
} {
  const isSearch = actionType === EnumSearchActionType.SEARCH;
  const isLoadMore = actionType === EnumSearchActionType.LOAD_MORE;
  const defaultSize = defaultPageSize || Constants.DEFAULT_SEARCH_PAGE_SIZE;
  const defaultStep = defaultPageStep || Constants.DEFAULT_SEARCH_STEP;
  let { pageIndex = Constants.DEFAULT_PAGE_INDEX, pageSize = defaultSize } = payload;
  if (isLoadMore) {
    pageSize = defaultStep;
    pageIndex = Math.floor(currentList.length / defaultStep) + 1;
  } else if (isSearch) {
    pageSize = defaultStep;
    pageIndex = Constants.DEFAULT_PAGE_INDEX;
  }
  return { pageIndex, pageSize, isSearch, isLoadMore };
}

/**
 * 分段分页查询前，先更新页面，优化用户体验
 * @param condition
 * @param updateState
 * @param actionType
 * @param defaultPageSize
 */
export function setPagerByActionTypeBeforeQuery(
  condition: IPageSampleCondition,
  updateState: IPageSampleData<any>,
  actionType: EnumSearchActionType,
  defaultPageSize: number = Constants.DEFAULT_SEARCH_PAGE_SIZE,
) {
  const isSearch = actionType === EnumSearchActionType.SEARCH;
  const isLoadMore = actionType === EnumSearchActionType.LOAD_MORE;
  const { pageIndex: current, pageSize: currentSize } = condition;
  updateState.actionType = actionType;
  if (Reflect.has(condition, 'keyword')) {
    updateState.keyword = condition.keyword;
  }
  if (!isLoadMore) {
    updateState.list = [];
  }
  if (isLoadMore || isSearch) {
    updateState.pagination.pageSize = defaultPageSize;
  } else {
    updateState.pagination.pageSize = currentSize;
  }
  if (isLoadMore) {
    updateState.pagination.current = Constants.DEFAULT_PAGE_INDEX;
  } else {
    updateState.pagination.current = current;
  }
}

/**
 * 设置分段分页查询数据集
 * @param content
 * @param updateState
 * @param actionType
 * @param defaultPageSize
 */
export function setPagerByActionType(
  content: IDbGptApiPageData<any>,
  updateState: IPageSampleData<any>,
  actionType: EnumSearchActionType,
  defaultPageSize: number = Constants.DEFAULT_SEARCH_PAGE_SIZE,
) {
  const isSearch = actionType === EnumSearchActionType.SEARCH;
  const isLoadMore = actionType === EnumSearchActionType.LOAD_MORE;
  const { data, total, page: current, page_size: currentSize} = content;
  updateState.pagination.total = total;
  if (isLoadMore || isSearch) {
    updateState.pagination.pageSize = defaultPageSize;
  } else {
    updateState.pagination.pageSize = currentSize || updateState.pagination.pageSize;
  }
  if (isLoadMore) {
    updateState.list = [...updateState.list, ...data];
    updateState.pagination.current = Constants.DEFAULT_PAGE_INDEX;
  } else {
    updateState.list = data || [];
    updateState.pagination.current = current;
  }
}

export enum EnumResultCode {
  /** 成功 */
  SUCCESS = 0,
  /** 失败 */
  ERROR = 1,
}

/** label、value的后端格式 */
export interface ILabelValueApiItem {
  id: any;
  name: string;
  [key: string]: any;
}

/** label、value的前端格式 */
export interface ILabelValueFrontItem {
  value: any;
  label?: string;
  [key: string]: any;
}

/** 通用树形数据格式 */
export interface ITreeNodeData<T = any> {
  key: string;
  title: string;
  data?: T;
  editing?: boolean;
  parentKey?: string;
  children?: ITreeNodeData<T>[];
  [key: string]: any;
}

/** 通用Label Value Children 数据格式 */
export interface ILabelValueChildrenData<T = any> {
  value: any;
  label: string;
  data?: T;
  children: ILabelValueChildrenData<T>[];
  [key: string]: any;
}

/**
 * 结果格式
 */
export interface IApiResult<T> {
  code: number;
  content: T;
  message?: string;
}

export interface IApiPageResult<T> {
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
  data: ApiResponse<IDbGptApiData<T>> | any;
  onSuccess?: (content: T) => void;
  onError?: (data: any) => void;
  operate?: string;
  sucMsg?: boolean;
  errMsg?: boolean;
  condition?: boolean;
  reactNode?: boolean;
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
  const { onSuccess, onError, errMsg, condition = true, reactNode = false } = props;
  const data = props.data.data;
  let result = false;
  let { sucMsg, operate = OPERATE_TYPES.QUERY } = props;
  const defaultNoSucMsg = NO_SUC_MSG.includes(operate);
  if (sucMsg !== true && defaultNoSucMsg) {
    sucMsg = false;
  }
  operate = getOperateType(operate);
  if (data?.success && condition) {
    result = true;
    onSuccess?.(data.data);
    if (sucMsg !== false) {
      showSiteSuccess({ description: localeMsg('operate.msg.suc', { name: operate }) });
    }
  } else if (!data || !data.success) {
    onError?.(data);
    if (errMsg !== false && data?.err_msg && !reactNode) {
      showSiteError({
        description: localeMsg('operate.msg.err', { name: operate, err: data.err_msg }),
      });
    }

    if (errMsg !== false && data?.err_msg && reactNode) {
      showSiteError({
        description: localeMsg('operate.msg.err', {
          name: operate,
          err: <span dangerouslySetInnerHTML={{ __html: data?.err_msg }}></span>,
        }),
      });
    }
  }
  return result;
}
