import { FC } from 'react';
import ICON_USER from '../../images/icons_user.svg';

interface IUserAvatar extends React.ImgHTMLAttributes<HTMLImageElement> {
  workNo?: string;
}

export const UserAvatar: FC<IUserAvatar> = props => {
  const { src, workNo, style = {}, ...restProps } = props;
  const handleError = (e: any) => (e.target.src = src || ICON_USER);
  return (
    <img
      alt=''
      // src={`/${workNo}.jpg`}
      onError={handleError}
      style={{ objectFit: 'cover', borderRadius: '100%', ...style }}
      src={`https://originalapi.catl.com/iirp-api/public/file/images/${workNo}.jpg`}
      {...restProps}
    />
  );
};
