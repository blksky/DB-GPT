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

export default {
  lang: 'en',
  ...common,
  ...setting,
  ...connection,
  ...workspace,
  ...menu,
  ...dashboard,
  ...chat,
  ...team,
  ...login,
  ...editTable,
  ...editTableData,
  ...sqlEditor,
};
