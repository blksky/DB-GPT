import { apiInterceptors, postChatModeParamsFileLoad, postChatModeParamsList } from '@/client/api';
import DBIcon from '@/components/common/db-icon';
import KnowledgeSearch from '@/new-components/chat/input/KnowledgeSearch';
import { ChatContentContext, EnumResourceType } from '@/pages/chat';
import { IDB } from '@/types/chat';
import { dbMapper } from '@/utils';
import { FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useAsyncEffect, useRequest } from 'ahooks';
import { Button, Flex, Select, Tooltip, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import React, {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

const KnowledgeResource: React.FC<{
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  fileName: string;
}> = forwardRef(({ fileList, setFileList, setLoading, fileName }, ref) => {
  const {
    setResourceValue,
    setResourceType,
    setResourceScopeValue,
    appInfo,
    refreshHistory,
    refreshDialogList,
    modelValue,
    resourceType,
    resourceValue,
  } = useContext(ChatContentContext);

  const refKnowledgeSearch = useRef<any>(null);

  const searchParams = useSearchParams();
  const scene = searchParams?.get('scene') ?? '';
  const chatId = searchParams?.get('id') ?? '';

  // dataBase
  const [dbs, setDbs] = useState<IDB[]>([]);

  // 左边工具栏动态可用key
  const paramKey: string[] = useMemo(() => {
    return appInfo.param_need?.map(i => i.type) || [];
  }, [appInfo.param_need]);

  const isDataBase = useMemo(() => {
    return (
      paramKey.includes('resource') && appInfo.param_need?.filter(i => i.type === 'resource')[0]?.value === 'database'
    );
  }, [appInfo.param_need, paramKey]);

  const isKnowledge = useMemo(() => {
    return (
      paramKey.includes('resource') && appInfo.param_need?.filter(i => i.type === 'resource')[0]?.value === 'knowledge'
    );
  }, [appInfo.param_need, paramKey]);

  const resource = useMemo(() => appInfo.param_need?.find(i => i.type === 'resource'), [appInfo.param_need]);

  // 获取db
  const { run, loading } = useRequest(async () => await apiInterceptors(postChatModeParamsList(scene as string)), {
    manual: true,
    onSuccess: data => {
      const [, res] = data;
      setDbs(res ?? []);
    },
  });

  useAsyncEffect(async () => {
    if ((isDataBase || isKnowledge) && !resource?.bind_value) {
      await run();
    }
  }, [isDataBase, isKnowledge, resource]);

  const dbOpts = useMemo(
    () =>
      dbs.map?.((db: IDB) => {
        return {
          label: (
            <>
              <DBIcon
                width={24}
                height={24}
                src={dbMapper[db.type].icon}
                label={dbMapper[db.type].label}
                className='w-[1.5em] h-[1.5em] mr-1 inline-block mt-[-4px]'
              />
              {db.param}
            </>
          ),
          value: db.param,
        };
      }),
    [dbs],
  );

  // 上传
  const onUpload = useCallback(async () => {
    const formData = new FormData();
    formData.append('doc_file', fileList?.[0] as any);
    setLoading(true);
    const [_, res] = await apiInterceptors(
      postChatModeParamsFileLoad({
        convUid: chatId,
        chatMode: scene,
        data: formData,
        model: modelValue,
        config: {
          timeout: 1000 * 60 * 60,
        },
      }),
    ).finally(() => {
      setLoading(false);
    });
    if (res) {
      setResourceValue(res);
      await refreshHistory();
      await refreshDialogList();
    }
  }, [chatId, fileList, modelValue, refreshDialogList, refreshHistory, scene, setLoading, setResourceValue]);

  if (!resourceValue || !dbOpts?.find(d => d.value === resourceValue)) {
    setResourceValue(dbOpts?.[0]?.value);
  }

  const handleFileSearchOk = (checkedList: { id: number; space: string; doc_name: string }[]) => {
    setResourceValue(checkedList?.[0]?.space);
    setResourceScopeValue({ documents: checkedList });
  };

  useImperativeHandle(ref, () => {
    return {};
  });

  return (
    <>
      <KnowledgeSearch ref={refKnowledgeSearch} dbOpts={dbOpts} onOk={handleFileSearchOk} />
      <Flex gap={8}>
        <Select
          style={{ width: 140 }}
          popupMatchSelectWidth={false}
          value={resourceType}
          onChange={val => setResourceType(val)}
          options={[
            { value: EnumResourceType.KNOWLEDGE, label: '知识库' },
            { value: EnumResourceType.KNOWLEDGE_FILE, label: '知识库文件' },
            { value: EnumResourceType.KNOWLEDGE_FILE_UPLOAD, label: '上传本地文件' },
          ]}
        />
        {resourceType === EnumResourceType.KNOWLEDGE && (
          <Select
            value={resourceValue}
            className='w-52 h-8 rounded-3xl'
            onChange={val => setResourceValue(val)}
            disabled={!!resource?.bind_value}
            loading={loading}
            options={dbOpts}
          />
        )}
        {resourceType === EnumResourceType.KNOWLEDGE_FILE && (
          <Tooltip title='最多可选择5个文件'>
            <Button icon={<PlusOutlined />} onClick={() => refKnowledgeSearch.current.showSearch()}>
              选择文件
            </Button>
          </Tooltip>
        )}
        {resourceType === EnumResourceType.KNOWLEDGE_FILE_UPLOAD && (
          <Upload
            name='file'
            accept='.pdf'
            fileList={fileList}
            showUploadList={false}
            beforeUpload={(_, fileList) => {
              setFileList?.(fileList);
            }}
            customRequest={onUpload}
            // disabled={!!fileName || !!fileList[0]?.name}
          >
            <Tooltip title='可上传office文件' arrow={false} placement='bottom'>
              <div className='flex w-8 h-8 items-center justify-center rounded-md hover:bg-[rgb(221,221,221,0.6)]'>
                <FolderAddOutlined
                  className={classNames('text-xl', { 'cursor-pointer': !(!!fileName || !!fileList[0]?.name) })}
                />
              </div>
            </Tooltip>
          </Upload>
        )}
      </Flex>
    </>
  );
});

export default memo(KnowledgeResource);
