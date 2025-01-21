import classnames from 'classnames';
import { memo, useEffect, useState } from 'react';
import styles from './index.module.less';

import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';

// ----- components -----
import OperationLine from '../OperationLine';

import { TreeNodeType } from '@/dbpages/constants/';
import Tree from '@/dbpages/blocks/Tree';
import { treeConfig } from '@/dbpages/blocks/Tree/treeConfig';
import { ITreeNode } from '@/dbpages/typings/index';

interface IProps {
  className?: string;
}

export default memo<IProps>(props => {
  const { className } = props;
  const [treeData, setTreeData] = useState<ITreeNode[] | null>(null);

  const [searchValue, setSearchValue] = useState<string>('');

  const currentConnectionDetails = useWorkspaceStore(state => state.currentConnectionDetails);

  const getTreeData = (refresh = false) => {
    if (!currentConnectionDetails?.id) {
      setTreeData([]);
      return;
    }
    const treeNodeType = currentConnectionDetails.supportDatabase ? TreeNodeType.DATA_SOURCE : TreeNodeType.DATABASE;
    setTreeData(null);
    treeConfig[treeNodeType]
      .getChildren?.({
        dataSourceId: currentConnectionDetails.id,
        dataSourceName: currentConnectionDetails.alias,
        refresh: refresh,
        extraParams: {
          dataSourceId: currentConnectionDetails.id,
          dataSourceName: currentConnectionDetails.alias,
          databaseType: currentConnectionDetails.type,
        },
      })
      .then(res => {
        setTreeData(
          res.filter(
            d =>
              d.treeNodeType !== TreeNodeType.DATABASE ||
              window.location.origin === 'http://localhost:8000' ||
              !['dataease', 'graph_kg_platform', 'graph_platform_byd'].includes(d.name),
          ),
        );
      })
      .catch(() => {
        setTreeData([]);
      });
  };

  useEffect(() => {
    getTreeData();
  }, [currentConnectionDetails]);

  return (
    <div className={classnames(styles.treeContainer, className)}>
      <OperationLine getTreeData={getTreeData} searchValue={searchValue} setSearchValue={setSearchValue} />
      <Tree className={styles.treeBox} searchValue={searchValue} treeData={treeData} />
    </div>
  );
});
