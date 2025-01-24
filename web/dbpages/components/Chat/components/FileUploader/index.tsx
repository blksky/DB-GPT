import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { ChatSession, EnumChatStoreType } from '@/dbpages/components/Chat/store';
import { getChatStoreMethod } from '@/dbpages/components/Chat/store/ModelType';
import { getTableFileIcon } from '@/dbpages/utils/FileIconUtl';
import { getFileSizeString } from '@/dbpages/utils/FileUtil';
import { FolderAddFilled, FolderAddOutlined } from '@ant-design/icons';
import { Alert, Flex, Table, Tooltip, Typography, Upload } from 'antd';
import React from 'react';
import styles from './index.module.less';

type FileUploaderProps = {
  chatType?: EnumChatStoreType;
  chatSession: ChatSession;
};

export const showFileUploader = (chatSession: ChatSession) => {
  return !!chatSession.readingData && chatSession.readingData.canUpload;
};

const FileUploader: React.FC<FileUploaderProps> = props => {
  const { chatSession } = props;
  const chatStore = getChatStoreMethod(props.chatType)();

  if (!showFileUploader(chatSession)) {
    return null;
  }

  const uploadProps: any = {
    maxCount: 5,
    multiple: true,
    fileList: chatSession.readingData?.fileList || [],
    showUploadList: false,
    onChange(info: any) {
      console.log('info: ', info);
      chatStore.updateCurrentSession((session: ChatSession) => {
        if (session.readingData) {
          session.readingData.fileList = info.fileList;
        }
      });
    },
    beforeUpload: () => {
      return false;
    },
  };

  const fileCount = chatSession.readingData?.fileList?.length || 0;

  const renderTooltip = (): any => {
    const warning = '单次最多可上传5个文件，可上传文档类型：docx、xlsx、pptx、pdf、txt，每个文档最大20MB';
    if (!fileCount) return warning;
    const tableOpt: any = {
      size: 'middle',
      pagination: false,
      columns: [
        {
          title: '文件名',
          dataIndex: 'name',
          key: 'name',
          render: (name: string) => {
            return (
              <Flex align='center' gap={5}>
                {getTableFileIcon({ docName: name })}
                {name}
              </Flex>
            );
          },
        },
        {
          title: '大小',
          dataIndex: 'size',
          key: 'size',
          render: (size: number) => {
            return getFileSizeString(size);
          },
        },
        {
          title: '操作',
          render: (_: any, record: any) => {
            return (
              <Typography.Link
                onClick={e => {
                  e.preventDefault?.();
                  e.stopPropagation?.();
                  chatStore.updateCurrentSession((session: ChatSession) => {
                    if (session.readingData?.fileList) {
                      session.readingData.fileList = session.readingData.fileList.filter(
                        (item: any) => item.uid !== record.uid,
                      );
                    }
                  });
                }}
              >
                移除
              </Typography.Link>
            );
          },
        },
      ],
      dataSource: chatSession.readingData?.fileList || [],
    };
    return (
      <Flex vertical={true} gap={10} style={{ width: 500, padding: 10 }}>
        <Alert type='warning' message={warning} />
        <Table {...tableOpt} />
      </Flex>
    );
  };

  return (
    <Upload {...uploadProps}>
      <Tooltip
        autoAdjustOverflow={false}
        placement={fileCount ? 'topLeft' : 'top'}
        color={Constants.TOOLTIP_COLOR}
        title={renderTooltip()}
        overlayStyle={{
          maxWidth: fileCount ? 'none' : 250,
        }}
      >
        {fileCount ? (
          <FolderAddFilled className={styles['chat-message-file-upload']} />
        ) : (
          <FolderAddOutlined className={styles['chat-message-file-upload']} />
        )}
      </Tooltip>
    </Upload>
  );
};

export default FileUploader;
