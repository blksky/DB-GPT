import { ChatContentContext } from '@/pages/chat';
import { UploadFile } from 'antd';
import { useSearchParams } from 'next/navigation';
import React, { memo, useContext } from 'react';

const KnowledgeSearch: React.FC<{
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fileName: string;
}> = ({ fileList, setFileList, setLoading, fileName }) => {
  const {
    setResourceValue,
    setResourceType,
    appInfo,
    refreshHistory,
    refreshDialogList,
    modelValue,
    resourceType,
    resourceValue,
  } = useContext(ChatContentContext);

  const searchParams = useSearchParams();

  return <></>;
};

export default memo(KnowledgeSearch);
