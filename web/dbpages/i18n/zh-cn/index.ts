import { LangType } from '@/dbpages/constants';
import chat from './chat';
import common from './common';
import connection from './connection';
import dashboard from './dashboard';
import editTable from './editTable';
import editTableData from './editTableData';
import login from './login';
import menu from './menu';
import setting from './setting';
import sqlEditor from './sqlEditor';
import team from './team';
import workspace from './workspace';

import knowledge from './knowledge';
import operate from './operate';
import pages from './pages';

export default {
  lang: LangType.ZH_CN,
  ...connection,
  ...common,
  ...setting,
  ...workspace,
  ...menu,
  ...connection,
  ...dashboard,
  ...chat,
  ...team,
  ...login,
  ...editTable,
  ...editTableData,
  ...sqlEditor,
  ...knowledge,
  ...operate,
  ...pages,
};
