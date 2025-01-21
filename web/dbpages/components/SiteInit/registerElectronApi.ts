// 注册Electron关闭时，关闭服务
import { getBaseURL } from '@/dbpages/service/base';
import { useSettingStore } from '@/dbpages/store/setting';

const registerElectronApi = () => {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  window.electronApi?.registerAppMenu({
    // @ts-ignore
    version: __APP_VERSION__,
  });
  // @ts-ignore
  window.electronApi?.setBaseURL?.(getBaseURL());
  // @ts-ignore
  window.electronApi?.setForceQuitCode?.(useSettingStore.getState().holdingService);
};

export default registerElectronApi;
