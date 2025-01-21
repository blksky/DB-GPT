export class Constants {
  /** 空数据填充内容 */
  static EMPTY = '-';
  /** tooltip的背景色 */
  static TOOLTIP_COLOR = 'white';
  /** 是否是开发环境，目前是根据id是否等于4判断，这种判断不通用，因此增加此属性 */
  static IS_DEV_ENV = false;
  /** 是否启用下载 */
  static ENABLE_DOWNLOAD = false; // getProjectConfig().projectId !== 1;
  /** 是否启用删除 */
  static ENABLE_DELETE = true; // getProjectConfig().projectId !== 1;
  /** 是否启用审核 */
  static ENABLE_AUDIT = true; // getProjectConfig().projectId === 4;
  /**  登录url */
  static LOGIN_PATH = '/login';
  /**  登录回调参数 */
  static LOGIN_PARAM_RETURN = 'returnUrl';
  /** 系统是否处于维护状态 */
  static SYSTEM_MAINTENANCE = false;
  /** 系统维护状态的url */
  static SYSTEM_MAINTENANCE_PATH = '/maintenance';
  /** 本系统支持的最大密级等级，3为秘密，4为机密，5为绝密，红区只上传绝密 */
  static SYSTEM_MAX_SECURITY_LEVEL = 4;

  static SITE_CONTENT_SPLIT = 12;

  static SITE_CONTENT_SPLIT_LG = 24;

  static SITE_CONTENT_SPLIT_SM = 4;

  static SITE_CONTENT_SPLIT_MD = 8;

  static SITE_CONTENT_SPLIT_MD_LG = 16;

  /** 默认分页大小 */
  static DEFAULT_PAGE_SIZE = 10;
  /** 默认页码 */
  static DEFAULT_PAGE_INDEX = 1;
  /** 搜索、旧首页的默认分页大小 */
  static DEFAULT_SEARCH_PAGE_SIZE = 30;
  /** 搜索、旧首页的每次加载条数 */
  static DEFAULT_SEARCH_STEP = 10;
  /** 新首页的默认分页大小 */
  static DEFAULT_HOME_PAGE_SIZE = 30; // 27;
  /** 新首页的每次加载条数 */
  static DEFAULT_HOME_STEP = 10; // 9;
  /** 后台管理默认分页大小 */
  static DEFAULT_BACKEND_PAGE_SIZE = 20;
  /** 系统根ID */
  static SITE_ROOT = 'root';
  /** 滚动根ID */
  static SITE_SCROLL_ROOT = 'KG_SITE_SCROLL_ROOT';
  /** 热门文档个数 */
  static DEFAULT_SEARCH_HOT = 5;
  /** 热搜词个数 */
  static DEFAULT_SEARCH_WORD_HOT = 8;
  /** 显示loading延时 */
  static LOADING_DELAY = 500;
  /** 对话流角色-用户 */
  static CHAT_USER_ROLE: 'user' = 'user';
  /** 对话流角色-大模型 */
  static CHAT_ASSISTANT_ROLE: 'assistant' = 'assistant';
  /** 文件数量限制 */
  // static FILE_NUM = 5;
  static FILE_NUM = 100;
  /** 文件大小限制 */
  static FILE_SIZE = 50;
  /** 文件类型 */
  static FILE_TYPE_LIST = ['doc', 'docx', 'pptx', 'ppt', 'xlsx', 'xls', 'xlsm', 'pdf'];
  static FILE_TYPE_UPLOAD_TEMPLATE_LIST = ['xlsx'];
}
