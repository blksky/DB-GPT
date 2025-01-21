import { DEFAULT_LANG } from '@/dbpages/common/constants';
import { clearOlderLocalStorage } from '../../utils';
import { getLang, setLang } from '@/dbpages/utils/localStorage';
import initIndexedDB from './initIndexedDB';
// import registerElectronApi from './registerElectronApi';
import registerMessage from './registerMessage';
import registerNotification from './registerNotification';

// 初始化语言
const initLang = () => {
  const lang = getLang();
  if (!lang) {
    setLang(DEFAULT_LANG);
    document.documentElement.setAttribute('lang', DEFAULT_LANG);
    const date = new Date('2030-12-30 12:30:00').toUTCString();
    document.cookie = `CHAT2DB.LOCALE=${lang};Expires=${date}`;
  }
};

const init = () => {
  clearOlderLocalStorage();

  initLang();
  initIndexedDB();
  // registerElectronApi();

  registerMessage();
  registerNotification();

  return null;
};

export default init;
