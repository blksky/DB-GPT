import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { Checkbox, Col, Flex, List, Rate, Row, Skeleton, Space, Typography } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { FC, useMemo } from 'react';

// @ts-ignore
import ICON_AIABS from '@/dbpages/images/kgMain/icons_aiabs.svg?url';
// @ts-ignore
import ICON_DOC_TEXT from '@/dbpages/images/kgMain/icons_doc_text.svg?url';
// @ts-ignore
import ICONS_DIAMOND from '@/dbpages/images/kgSearch/icons_diamond.svg?url';
// @ts-ignore
import ICONS_DIAMOND_FILL from '@/dbpages/images/kgSearch/icons_diamond_fill.svg?url';

// @ts-ignore
import styles from './MainListItem.module.less';

export interface IMainListItem {
  [key: string]: any;
}

export interface MainListItemProps {
  loading?: boolean;
  skeleton?: boolean;
  /** 是否优先显示正文 */
  docTextPriority?: boolean;
  // 是否显示权限管理
  authorityShow?: boolean;
  item: IMainListItem | any;
  className?: string;
  /**是否选中 */
  checked?: boolean;
  showCheckbox?: boolean;
  formatItem?: () => IMainListItem;
  onShare?: (item: IMainListItem | any) => void;
  onLikeCallback?: () => void;
  onCollectCallback?: () => void;
  onDownloadCallback?: () => void;
  handleCheckChange?: (checked: boolean, item: { id: number; space: string; doc_name: string }) => void;
}

export const MainListItem: FC<MainListItemProps> = props => {
  const { loading, item, className, skeleton, docTextPriority, formatItem, checked, showCheckbox, handleCheckChange } =
    props;
  const renderItem = useMemo(() => formatItem?.() || item, [item]);
  const scoreCount = useMemo(() => {
    if (!renderItem?.score) {
      return 0;
    }
    if (renderItem.score <= 0.6) {
      return 1;
    }
    if (renderItem.score <= 0.7) {
      return 2;
    }
    if (renderItem.score <= 0.8) {
      return 3;
    }
    if (renderItem.score <= 0.9) {
      return 4;
    }
    return 5;
  }, [renderItem?.score]);

  const handleTitleClick = () => {};

  let descContent;
  const hideAbsKw = renderItem?.hideAbsKw;
  const hideContext = renderItem?.hideContext;
  if (docTextPriority && renderItem.docText?.length && !hideContext) {
    descContent = (
      <>
        <img alt='' className={styles['img-aiabs']} src={ICON_DOC_TEXT} />
        <span dangerouslySetInnerHTML={{ __html: renderItem.docText }} />
      </>
    );
  } else if (!hideAbsKw) {
    descContent = (
      <>
        {renderItem.docAbsType && <img alt='' className={styles['img-aiabs']} src={ICON_AIABS} />}
        <span dangerouslySetInnerHTML={{ __html: renderItem.docAbs }} />
      </>
    );
  }

  const content = (
    <Flex gap={16} align='center'>
      {showCheckbox && (
        <Checkbox
          checked={checked}
          disabled={renderItem?.hideContext}
          onChange={e =>
            handleCheckChange?.(e.target.checked, {
              id: renderItem.id,
              space: renderItem.space,
              doc_name: renderItem.docName,
            })
          }
        />
      )}
      <List.Item.Meta
        title={
          <Row gutter={Constants.SITE_CONTENT_SPLIT_MD} wrap={false}>
            <Col flex='auto'>
              <Typography.Paragraph ellipsis className={styles['main-list-item-name']}>
                <Link
                  target='_blank'
                  href={`/construct/knowledge/chunk/?spaceName=${renderItem.space}&id=${renderItem.id}`}
                  dangerouslySetInnerHTML={{ __html: renderItem.docName }}
                  onClick={handleTitleClick}
                />
              </Typography.Paragraph>
            </Col>
            {!!renderItem.score && (
              <Col flex='none'>
                <Space align='center' className={styles['main-list-item-rate']} size={Constants.SITE_CONTENT_SPLIT_SM}>
                  <span className={styles['main-list-item-rate-label']}>{localeMsg('page.search.item.rate')}</span>
                  <Rate
                    disabled={true}
                    allowHalf={false}
                    value={scoreCount}
                    character={({ value = 0, index = 0 }) => (
                      <img alt='' src={value >= index + 1 ? ICONS_DIAMOND_FILL : ICONS_DIAMOND} />
                    )}
                  />
                </Space>
              </Col>
            )}
          </Row>
        }
        description={
          <Typography.Paragraph className={styles['main-list-item-desc']} ellipsis={{ rows: 2 }}>
            {descContent}
          </Typography.Paragraph>
        }
      />
    </Flex>
  );
  return (
    <List.Item className={classNames(styles['main-list-item'], className)} actions={[]}>
      {skeleton ? (
        <Skeleton loading={loading} active>
          {content}
        </Skeleton>
      ) : (
        content
      )}
    </List.Item>
  );
};
