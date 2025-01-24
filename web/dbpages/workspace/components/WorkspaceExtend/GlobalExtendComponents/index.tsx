import { useWorkspaceStore } from '@/dbpages/workspace/store';
import ViewDDL from '../../../../components/ViewDDL';
import { GlobalComponents } from '../config';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

const GlobalExtendComponents = () => {
  const { currentWorkspaceGlobalExtend } = useWorkspaceStore(state => {
    return {
      currentWorkspaceGlobalExtend: state.currentWorkspaceGlobalExtend,
    };
  });

  switch (currentWorkspaceGlobalExtend?.code) {
    case GlobalComponents.view_ddl:
      return (
        <div className={styles.viewDDLBox}>
          <div className={styles.viewDDLHeader}>{`${currentWorkspaceGlobalExtend.uniqueData.tableName}-DDL`}</div>
          <ViewDDL data={currentWorkspaceGlobalExtend.uniqueData} />
        </div>
      );
    default:
      return <div className={styles.noInformation}>No information</div>;
  }
};

export default GlobalExtendComponents;
