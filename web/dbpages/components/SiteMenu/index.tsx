import Setting from '@/dbpages/blocks/Setting';
// import BrandLogo from '@/pages/dbpages/components/BrandLogo';
import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import Iconfont from '@/dbpages/components/Iconfont';
// import { history } from '@umijs/max';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import './index.less';

export const SiteMenu = (props: any) => {
  const { menuData } = props;
  const [activeNavKey, setActiveNavKey] = useState<string>('');

  const switchingNav = (key: any) => {
    setActiveNavKey(key);
    // history.push(key);
  };

  useEffect(() => {
    setActiveNavKey(`/${window.location.pathname.split('/')[1]}`);
  }, [window.location.pathname]);

  return (
    <div className='site-menu-container'>
      {/*<BrandLogo size={38} className='brandLogo' />*/}
      <ul className='navList'>
        {menuData.map((item: any) => {
          return (
            <Tooltip key={item.key} placement='right' title={item.name} color={Constants.TOOLTIP_COLOR}>
              <li
                className={classnames({
                  ['activeNav']: item.key === activeNavKey,
                })}
                onClick={() => switchingNav(item.path)}
              >
                <Iconfont size={24} className='icon' code={item.icon} />
              </li>
            </Tooltip>
          );
        })}
      </ul>
      <div className='footer'>
        <Setting />
      </div>
    </div>
  );
};
