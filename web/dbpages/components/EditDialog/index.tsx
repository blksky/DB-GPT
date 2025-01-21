import { Modal, Spin } from 'antd';
import classnames from 'classnames';
import { Suspense, lazy, memo, useEffect, useRef, useState } from 'react';
import { IRangeType } from '../MonacoEditor';
import styles from './index.module.less';

const MonacoEditor = lazy(() => import('@/dbpages/components/MonacoEditor'));

interface IProps {
  className?: string;
  verifyDialog: boolean;
  title: string;
  value: {
    text: string;
    range: IRangeType;
  };
}

export default memo<IProps>(function EditDialog(props) {
  const { className, verifyDialog, value, title } = props;
  const [open, setOpen] = useState<boolean>();
  const monacoEditorRef = useRef<any>();

  useEffect(() => {
    setOpen(verifyDialog);
  }, [verifyDialog]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current?.setValue(value.text, value.range);
    }
  }, [value]);

  return (
    <div className={classnames(styles.box, className)}>
      <Modal
        title={title}
        open={open}
        width={800}
        // onCancel={(() => { setVerifyDialog(false) })}
      >
        <Suspense fallback={<Spin />}>
          <MonacoEditor id='edit-dialog' ref={monacoEditorRef} />
        </Suspense>
      </Modal>
    </div>
  );
});
