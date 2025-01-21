import style from './index.module.less';

interface IProps {
  className: string;
}

function LayoutBasic(props: IProps) {
  return (
    <div className={style.layoutBasic}>
      <div></div>
    </div>
  );
}

export default LayoutBasic;
