import { cancelEvent } from '@/dbpages/utils/CommonUtil';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { AutoComplete, Flex, Input, InputProps, Typography } from 'antd';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchStore } from './store';
import { ISearchCondition } from './store/ModelType';

// @ts-ignore
import ICON_SEARCH from './images/icon_search.svg?url';

// @ts-ignore
import { Constants } from '../Chat/helper/Constants';

// @ts-ignore
import styles from './SearchInput.module.less';

export type SearchInputProps = {
  loading: boolean;
  defaultSearchLoading?: boolean;
  defaultValue?: ISearchCondition;
  onChange: (keyword: string) => void;
  onBlur: () => void;
  onSearch: (condition: ISearchCondition, isItemClick?: boolean) => void;
  onInputClick?: () => void;
  inputProps?: InputProps;
};

export const SearchInput: FC<SearchInputProps> = props => {
  const {
    loading,
    defaultSearchLoading,
    onSearch,
    onChange,
    onBlur,
    onInputClick,
    defaultValue,
    inputProps = {},
  } = props;
  const refInput = useRef<any>();
  const { precisionOpen, promptList, fetchSearchPrompt, historyShow, historyList, historyDelete, deptList } =
    useSearchStore();
  const [keyword, setKeyword] = useState(defaultValue?.keyword);
  const [conditions, setConditions] = useState<any>(defaultValue || {});
  useEffect(() => {
    setKeyword(defaultValue?.keyword);
    setConditions(defaultValue || {});
  }, [defaultValue]);

  const handleChange = (e: string) => {
    onChange(e);
    setKeyword(e);
  };
  const handleBlur = () => {
    setTimeout(() => {
      onBlur();
    }, 300);
  };

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (keyword: string) => {
      await fetchSearchPrompt(keyword);
    };

    return debounce(loadOptions, 1000);
  }, [fetchSearchPrompt]);

  const handleSearch = (e: any, isItemClick?: boolean) => {
    const key = e.target.input ? e.target.input.value : e.target.value;
    const { values = {} } = conditions;
    if (e.__proto__.target?.tagName === 'path' && !key?.length && !Object.keys(values || {}).length) {
      return;
    }
    onSearch(
      {
        ...conditions,
        keyword: key,
      },
      isItemClick,
    );
  };

  const recentSearch: any = useMemo(() => {
    if (!historyList?.length) return null;
    return (
      <div className={styles['main-search-history-wrapper']}>
        <span className={styles['main-search-history-title']}>
          最近搜索
          <DeleteOutlined onClick={historyDelete} className={styles['delete-icon']} />
        </span>
        <Flex gap={8} wrap='wrap' className={styles['main-search-history-list']}>
          {historyList.map((item: any, index: number) => {
            return (
              <Typography.Text
                key={index}
                className={styles['main-search-history-item']}
                onClick={() => handleSearch({ target: { value: item } }, true)}
                ellipsis={{
                  tooltip: {
                    title: item,
                    color: Constants.TOOLTIP_COLOR,
                  },
                }}
              >
                {item}
              </Typography.Text>
            );
          })}
        </Flex>
      </div>
    );
  }, [historyList, deptList, conditions]);

  const inputOpts: InputProps = {
    size: 'large',
    onClick: onInputClick,
    onPressEnter: handleSearch,
    className: styles['main-search-input'],
    placeholder: '搜文章',
    allowClear: {
      clearIcon: <CloseOutlined style={{ fontSize: 'var(--site-font-size-lg)' }} />,
    },
    suffix: (
      <div
        className={styles['icon-search']}
        onClick={e => {
          cancelEvent(e, true);
          handleSearch({ target: refInput.current });
        }}
      >
        <img alt='' src={ICON_SEARCH} />
      </div>
    ),
    ...inputProps,
  };

  return (
    <AutoComplete
      value={keyword}
      options={
        promptList.length ? promptList : historyShow && recentSearch && !precisionOpen ? [{ label: '', value: '' }] : []
      }
      className={classNames(styles['main-search-input-auto'], { [styles['hasValue']]: !!keyword?.length })}
      popupClassName={styles['main-search-auto-popup']}
      onChange={handleChange}
      onBlur={handleBlur}
      onSearch={debounceFetcher}
      onSelect={e => handleSearch({ target: { value: e } }, true)}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      dropdownRender={menus => {
        if (!promptList?.length) {
          return recentSearch;
        }
        return menus;
      }}
    >
      <Input {...inputOpts} ref={e => (refInput.current = e)} />
    </AutoComplete>
  );
};
