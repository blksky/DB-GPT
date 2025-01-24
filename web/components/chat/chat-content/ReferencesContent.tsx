import MarkDownContext from '@/new-components/common/MarkdownContext';
import { Divider, Drawer, Flex, Tabs, TabsProps, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';

const ReferencesContentView: React.FC<{ references: any }> = ({ references }) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>();

  // 是否移动端页面
  const isMobile = useMemo(() => {
    return router.pathname.includes('/mobile');
  }, [router]);

  const items: TabsProps['items'] = useMemo(() => {
    return references?.map((reference: any) => {
      return {
        label: (
          <div style={{ maxWidth: '120px' }}>
            <Typography.Text
              ellipsis={{
                tooltip: reference.name,
              }}
            >
              {decodeURIComponent(reference.name).split('_')[0]}
            </Typography.Text>
          </div>
        ),
        key: reference.name,
        children: (
          <div className='h-full overflow-y-auto'>
            <Flex vertical={true} gap={24}>
              {reference?.chunks?.map((chunk: any) => (
                <MarkDownContext key={chunk.id}>{chunk.content}</MarkDownContext>
              ))}
            </Flex>
          </div>
        ),
      };
    });
  }, [references]);

  return (
    <div>
      <Divider className='mb-1 mt-0' dashed />
      {references.map((reference: any) => {
        return (
          <div
            key={reference.name}
            className='flex text-sm gap-2 text-blue-400'
            onClick={() => {
              setActiveKey(reference.name);
              setOpen(true);
            }}
          >
            <span className='text-sm'>{reference.name}</span>
          </div>
        );
      })}

      <Drawer
        open={open}
        title='回复引用'
        placement={isMobile ? 'bottom' : 'right'}
        onClose={() => setOpen(false)}
        destroyOnClose={true}
        className='p-0'
        {...(!isMobile && { width: '30%' })}
      >
        <Tabs activeKey={activeKey} items={items} size='small' />
      </Drawer>
    </div>
  );
};

const ReferencesContent: React.FC<{ references: any }> = ({ references }) => {
  try {
    const data = JSON.parse(references);
    return <ReferencesContentView references={data} />;
  } catch {
    return null;
  }
};

export default ReferencesContent;
