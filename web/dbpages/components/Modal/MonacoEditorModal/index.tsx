import { Modal, Spin } from 'antd';
import { Suspense, lazy, memo } from 'react';

const MonacoEditor = lazy(() => import('@/dbpages/components/MonacoEditor'));

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
        <Suspense fallback={<Spin />}>
          <MonacoEditor id='edit-dialog' ref={monacoEditorRef} />
        </Suspense>
      </div>
    </Modal>
  );
});

export default TriggeredModal;
