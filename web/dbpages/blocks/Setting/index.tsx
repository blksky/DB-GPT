import Iconfont from '../../components/Iconfont';
import { Modal, Tooltip } from 'antd';
import classnames from 'classnames';
import React, { ReactNode, useEffect, useState } from 'react';
// import { UserOutlined } from '@ant-design/icons';
import i18n from '@/dbpages/i18n';
import AISetting from './AiSetting';
import BaseSetting from './BaseSetting';
import ProxySetting from './ProxySetting';
// import UserSetting from './UserSetting';
import UpdateDetection, {
  IUpdateDetectionRef,
  UpdatedStatusEnum,
} from '@/dbpages/blocks/Setting/UpdateDetection';
import { ILatestVersion } from '@/dbpages/service/config';
import About from './About';
import styles from './index.module.less';

// ---- store -----
import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { getAiSystemConfig, setAiSystemConfig, useSettingStore } from '@/dbpages/store/setting';

interface IProps {
  className?: string;
  render?: ReactNode;
  noLogin?: boolean; // 用于在没有登录的页面使用，不显示ai设置等需要登录的功能
  defaultArouse?: boolean; // 是否默认弹出
  defaultMenu?: number; // 默认选中的菜单
}

export interface IUpdateDetectionData extends ILatestVersion {
  updatedStatusEnum: UpdatedStatusEnum;
  needUpdate: boolean;
}

function Setting(props: IProps) {
  const { className, noLogin = false, defaultArouse, defaultMenu = 0 } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<number>(defaultMenu);
  const [updateDetectionData, setUpdateDetectionData] = useState<IUpdateDetectionData | null>(null);
  const updateDetectionRef = React.useRef<IUpdateDetectionRef>(null);
  const aiConfig = useSettingStore(state => state.aiConfig);

  useEffect(() => {
    if (defaultArouse) {
      showModal();
    }
  }, []);

  useEffect(() => {
    if (isModalVisible && !noLogin) {
      getAiSystemConfig();
    }
  }, [isModalVisible]);

  useEffect(() => {
    if (!noLogin) {
      getAiSystemConfig();
    }
  }, []);

  const showModal = (_currentMenu: number = 0) => {
    setCurrentMenu(_currentMenu);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  function changeMenu(t: any) {
    setCurrentMenu(t);
  }

  const menusList = [
    {
      label: i18n('setting.nav.basic'),
      icon: '\ue795',
      body: <BaseSetting />,
      code: 'basic',
    },
    {
      label: i18n('setting.nav.customAi'),
      icon: '\ue646',
      body: <AISetting aiConfig={aiConfig} handleApplyAiConfig={setAiSystemConfig} />,
      code: 'ai',
    },
    {
      label: i18n('setting.nav.proxy'),
      icon: '\ue63f',
      body: <ProxySetting />,
      code: 'proxy',
    },
    // {
    //   label: '账户设置',
    //   icon: <UserOutlined />,
    //   body: <UserSetting />,
    //   code: 'user',
    // },
    {
      label: i18n('setting.nav.aboutUs'),
      icon: '\ue65c',
      rightSlot: updateDetectionData?.needUpdate && (
        <div className={classnames(styles.rightSlot, styles.rightSlotAbout)}>
          <Tooltip color={Constants.TOOLTIP_COLOR} title={`发现新版本v${updateDetectionData?.version}`}>
            <Iconfont code='&#xe69c;' />
          </Tooltip>
        </div>
      ),
      body: <About updateDetectionRef={updateDetectionRef as any} updateDetectionData={updateDetectionData} />,
      code: 'about',
    },
  ];

  return (
    <>
      <Tooltip placement='right' title={i18n('setting.title.setting')} color={Constants.TOOLTIP_COLOR}>
        <div
          className={classnames(className, styles.box)}
          onClick={() => {
            showModal();
          }}
        >
          {props.render ? props.render : <Iconfont className={styles.settingIcon} code='&#xe630;' />}
        </div>
      </Tooltip>

      <UpdateDetection
        setUpdateDetectionData={setUpdateDetectionData}
        updateDetectionData={updateDetectionData}
        openSettingModal={showModal}
        ref={updateDetectionRef}
      />
      <Modal
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={800}
        maskClosable={false}
      >
        <div className={styles.modalBox}>
          <div className={styles.menus}>
            <div className={classnames(styles.menusTitle)}>{i18n('setting.title.setting')}</div>
            {menusList.map((t, index) => {
              // 如果是没有登录的页面，不显示ai设置等需要登录的功能
              if (noLogin && index === 1) {
                return false;
              }
              return (
                <div
                  key={index}
                  onClick={changeMenu.bind(null, index)}
                  className={classnames(styles.menuItem, {
                    [styles.activeMenu]: t.label === menusList[currentMenu].label,
                  })}
                >
                  <Iconfont className={styles.prefixIcon} code={t.icon} />
                  {t.label}
                  {t.rightSlot}
                </div>
              );
            })}
          </div>
          <div className={styles.menuContent}>
            <div className={classnames(styles.menuContentTitle)}>{menusList[currentMenu].label}</div>
            {menusList[currentMenu].body}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Setting;
