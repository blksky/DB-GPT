import { ThemeType } from '@/dbpages/constants';
import useCopyFocusData from '@/dbpages/hooks/useFocusData';
import usePollRequestService, { ServiceStatus } from '@/dbpages/hooks/usePollRequestService';
import { useTheme } from '@/dbpages/hooks/useTheme';
import { isEn } from '../../i18n';
import service from '@/dbpages/service/misc';
import { queryCurUser, useUserStore } from '@/dbpages/store/user';
import { getAntdThemeConfig } from '../../theme';
import { ConfigProvider } from 'antd';
import antdEnUS from 'antd/locale/en_US';
import antdZhCN from 'antd/locale/zh_CN';
import { useEffect, useLayoutEffect, useState } from 'react';
import SiteInit from '../SiteInit';
import GlobalComponent from '../SiteInit/GlobalComponent';
import styles from './index.module.less';

const GlobalLayout = ({ children }: any) => {
  const [appTheme, setAppTheme] = useTheme();
  const [antdTheme, setAntdTheme] = useState<any>({});
  const { curUser } = useUserStore(state => {
    return {
      curUser: state.curUser,
    };
  });

  const { serviceStatus, restartPolling } = usePollRequestService({
    loopService: service.testService,
  });

  // 监听系统(OS)主题变化
  const monitorOsTheme = () => {
    function change(e: any) {
      if (appTheme.backgroundColor === ThemeType.FollowOs) {
        setAppTheme({
          ...appTheme,
          backgroundColor: e.matches ? ThemeType.Dark : ThemeType.Light,
        });
      }
    }

    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    matchMedia.onchange = change;
  };

  useCopyFocusData();

  useLayoutEffect(() => {
    setAntdTheme(getAntdThemeConfig(appTheme));
  }, [appTheme]);

  useLayoutEffect(() => {
    SiteInit();
    monitorOsTheme();
  }, []);

  useEffect(() => {
    if (serviceStatus === ServiceStatus.SUCCESS) {
      queryCurUser();
    }
  }, [serviceStatus]);

  return (
    <ConfigProvider locale={isEn ? antdEnUS : antdZhCN} theme={antdTheme}>
      <div className={styles.app}>{children}</div>
      <GlobalComponent />
    </ConfigProvider>
  );
};

export default GlobalLayout;
