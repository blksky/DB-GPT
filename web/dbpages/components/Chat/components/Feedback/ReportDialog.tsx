import { Modal, Typography } from 'antd';
import React, { useState } from 'react';

const GoldSqlDialog: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Typography.Link style={{ marginLeft: 10 }} onClick={showModal}>
        添加至报表
      </Typography.Link>
      <Modal title='添加至报表' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>模块开发中...</p>
      </Modal>
    </>
  );
};

export default GoldSqlDialog;
