import { TabPane, Tabs } from '@douyinfe/semi-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab } from '../../data/constants';
import { databases } from '../../data/databases';
import { useDiagram, useLayout, useSelect } from '../../hooks';
import i18n from '../../i18n/i18n';
import { isRtl } from '../../i18n/utils/rtl';
import AreasTab from './AreasTab/AreasTab';
import EnumsTab from './EnumsTab/EnumsTab';
import Issues from './Issues';
import NotesTab from './NotesTab/NotesTab';
import RelationshipsTab from './RelationshipsTab/RelationshipsTab';
import TablesTab from './TablesTab/TablesTab';
import TypesTab from './TypesTab/TypesTab';

export default function SidePanel({ width, resize, setResize, setResizeTarget }) {
  const { layout } = useLayout();
  const { selectedElement, setSelectedElement } = useSelect();
  const { database } = useDiagram();
  const { t } = useTranslation();

  const tabList = useMemo(() => {
    const tabs = [
      { tab: t('tables'), itemKey: Tab.TABLES, component: <TablesTab /> },
      {
        tab: t('relationships'),
        itemKey: Tab.RELATIONSHIPS,
        component: <RelationshipsTab />,
      },
      { tab: t('subject_areas'), itemKey: Tab.AREAS, component: <AreasTab /> },
      { tab: t('notes'), itemKey: Tab.NOTES, component: <NotesTab /> },
    ];

    if (databases[database].hasTypes) {
      tabs.push({
        tab: t('types'),
        itemKey: Tab.TYPES,
        component: <TypesTab />,
      });
    }

    if (databases[database].hasEnums) {
      tabs.push({
        tab: t('enums'),
        itemKey: Tab.ENUMS,
        component: <EnumsTab />,
      });
    }

    return isRtl(i18n.language) ? tabs.reverse() : tabs;
  }, [t, database]);

  return (
    <div className='flex h-full'>
      <div className='flex flex-col h-full relative border-r border-color' style={{ width: `${width}px` }}>
        <div className='h-full flex-1 overflow-y-auto'>
          <Tabs
            type='card'
            activeKey={selectedElement.currentTab}
            lazyRender
            onChange={key => setSelectedElement(prev => ({ ...prev, currentTab: key }))}
            collapsible
            tabBarStyle={{ direction: 'ltr' }}
          >
            {tabList.length &&
              tabList.map(tab => (
                <TabPane tab={tab.tab} itemKey={tab.itemKey} key={tab.itemKey}>
                  <div className='p-2'>{tab.component}</div>
                </TabPane>
              ))}
          </Tabs>
        </div>
        {layout.issues && (
          <div className='mt-auto border-t-2 border-color shadow-inner'>
            <Issues />
          </div>
        )}
      </div>
      <div
        style={{ margin: '-4px' }}
        className={`flex justify-center items-center p-1 h-auto hover-2 cursor-col-resize opacity-0 transition-opacity ${
          resize && 'bg-semi-grey-2 opacity-0.5'
        }`}
        onPointerDown={e => {
          if (e.isPrimary) {
            setResize(true);
            setResizeTarget(e.target);
          }
        }}
      >
        <div className='w-1 border-x border-color h-1/6' />
      </div>
    </div>
  );
}
