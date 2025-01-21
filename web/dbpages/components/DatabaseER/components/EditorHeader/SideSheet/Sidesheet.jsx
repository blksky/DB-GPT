import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import todo from '../../../assets/calendar.png';
import timeLine from '../../../assets/process.png';
import timeLineDark from '../../../assets/process_dark.png';
import { SIDESHEET } from '../../../data/constants';
import { useSettings } from '../../../hooks';
import Timeline from './Timeline';
import Todo from './Todo';

export default function Sidesheet({ type, onClose }) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  function getTitle(type) {
    switch (type) {
      case SIDESHEET.TIMELINE:
        return (
          <div className='flex items-center'>
            <img src={settings.mode === 'light' ? timeLine : timeLineDark} className='w-7' alt='chat icon' />
            <div className='ms-3 text-lg'>{t('timeline')}</div>
          </div>
        );
      case SIDESHEET.TODO:
        return (
          <div className='flex items-center'>
            <img src={todo} className='w-7' alt='todo icon' />
            <div className='ms-3 text-lg'>{t('to_do')}</div>
          </div>
        );
      default:
        break;
    }
  }

  function getContent(type) {
    switch (type) {
      case SIDESHEET.TIMELINE:
        return <Timeline />;
      case SIDESHEET.TODO:
        return <Todo />;
      default:
        break;
    }
  }

  return (
    <Drawer
      open={type !== SIDESHEET.NONE}
      onClose={onClose}
      width={300}
      title={getTitle(type)}
      style={{ paddingBottom: '16px' }}
      bodyStyle={{ padding: '0px' }}
    >
      {getContent(type)}
    </Drawer>
  );
}
