import Output from '../../../../../dbpages/components/Output';
import ViewDDL from '../../../../../dbpages/components/ViewDDL';
import i18n from '../../../../../dbpages/i18n';
import SaveList from '../SaveList';
import GlobalExtendComponents from './GlobalExtendComponents';

interface IToolbar {
  code: string;
  title: string;
  icon: string;
  components: any;
}

export enum GlobalComponents {
  view_ddl = 'viewDDL',
  executive_log = 'executiveLog',
  save_list = 'saveList',
}

export const globalComponents: {
  [key in GlobalComponents]: any;
} = {
  [GlobalComponents.view_ddl]: ViewDDL,
  [GlobalComponents.executive_log]: Output,
  [GlobalComponents.save_list]: SaveList,
};

export const extendConfig: IToolbar[] = [
  {
    code: 'info',
    title: i18n('common.title.info'),
    icon: '\ue8e8',
    components: GlobalExtendComponents,
  },
  {
    code: 'executiveLog',
    title: i18n('common.title.executiveLogging'),
    icon: '\ue8ad',
    components: globalComponents.executiveLog,
  },
  {
    code: 'saveList',
    title: i18n('workspace.title.savedConsole'),
    icon: '\ue619',
    components: globalComponents.saveList,
  },
];
