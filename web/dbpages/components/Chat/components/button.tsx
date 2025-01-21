import { Button } from 'antd';

import classNames from 'classnames';
import styles from './button.module.less';

export type ButtonType = 'primary' | 'danger' | null;

export function IconButton(props: {
  onClick?: () => void;
  icon?: JSX.Element;
  type?: ButtonType;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
}) {
  return (
    <Button
      // @ts-ignore
      type={props.type}
      icon={props.icon}
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      tabIndex={props.tabIndex}
      autoFocus={props.autoFocus}
      className={classNames(styles.iconButton, props.className)}
    >
      {props.text}
    </Button>
  );
}
