import DatabaseDoc from '@/pages/dbpages/knowledge/databaseDoc';
import { ConsoleSqlOutlined, FileTextOutlined } from '@ant-design/icons';
import { Flex, Menu } from 'antd';
import { useEffect, useState } from 'react';
import i18n from '../../../dbpages/i18n';
import GoldSql from './goldSql';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import styles from './index.module.less';

interface IProps {
  className?: string;
}

enum EnumKnowMenu {
  GOLD_SQL = 'GOLD_SQL',
  DATABASE_DOC = 'DATABASE_DOC',
}

function KnowledgeIndex(props: IProps) {
  const [activeMenuKey, setActiveMenuKey] = useState<EnumKnowMenu>(EnumKnowMenu.GOLD_SQL);
  useEffect(() => {}, []);

  const handleMenuClick: any = (e: any) => {
    setActiveMenuKey(e.key);
  };

  const renderLeft = () => (
    <Menu
      mode='inline'
      className={styles.boxLeftMenu}
      onClick={handleMenuClick}
      style={{ width: '100%' }}
      defaultSelectedKeys={[activeMenuKey]}
      items={[
        {
          key: EnumKnowMenu.GOLD_SQL,
          label: 'Gold SQL',
          icon: <ConsoleSqlOutlined />,
        },
        {
          key: EnumKnowMenu.DATABASE_DOC,
          label: '库表描述文档',
          icon: <FileTextOutlined />,
        },
      ]}
    />
  );

  const renderContent = () => {
    if (activeMenuKey === EnumKnowMenu.GOLD_SQL) {
      return <GoldSql />;
    } else if (activeMenuKey === EnumKnowMenu.DATABASE_DOC) {
      return <DatabaseDoc />;
    }
    return <GoldSql />;
  };

  return (
    <Flex>
      <div className={styles.dragBox}>
        <div className={styles.boxLeft}>
          <div className={styles.boxLeftTitle}>
            <div>{i18n('knowledge.title')}</div>
          </div>
          {renderLeft()}
        </div>
      </div>
      <div className={styles.boxRight}>{renderContent()}</div>
    </Flex>
  );
}

export default KnowledgeIndex;
