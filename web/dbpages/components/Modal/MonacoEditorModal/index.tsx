import { Modal, Spin } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';

const MonacoEditor = dynamic(() => import('@/dbpages/components/MonacoEditor'), {
  ssr: false,
  loading: () => <Spin />,
});

const TriggeredModal = memo<ITriggeredModal>(() => {
  return (
    <Modal
      title={`${data.key}-DDL`}
      open={monacoVerifyDialog}
      width='650px'
      onCancel={() => {
        setMonacoVerifyDialog(false);
      }}
      footer={false}
    >
      <div className={styles.monacoEditorBox}>
        <MonacoEditor id='edit-dialog' ref={monacoEditorRef} />
      </div>
    </Modal>
  );
});

export default TriggeredModal;
