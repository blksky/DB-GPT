import { InputProps } from 'antd';
import classNames from 'classnames';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SearchInput } from './SearchInput';
import { useSearchStore } from './store';
import { ISearchCondition } from './store/ModelType';

// @ts-ignore
import styles from './index.module.less';

export type SampleSearchProps = {
  formRef?: any;
  loading: boolean;
  defaultSearchLoading?: boolean;
  keyword?: string;
  isResult?: boolean;
  showType?: boolean;
  enterButton?: string;
  filterOpen?: boolean;
  setFilterOpen?: (open: boolean) => void;
  searchType?: string;
  defaultValue?: ISearchCondition;
  inputProps?: InputProps;
  onSearchType?: (searchType: string) => void;
  onSearch: (condition: ISearchCondition) => void;
};

export const SampleSearch = forwardRef((props: SampleSearchProps, ref) => {
  const { historyHiddenFn, historyShowFn, historyAdd } = useSearchStore();
  const { isResult, loading, defaultSearchLoading, onSearch, defaultValue, inputProps } = props;
  const [keyword, setKeyword] = useState(defaultValue?.keyword);

  const handleInputClick = () => {
    historyShowFn();
  };

  const handleSearch = (condition: ISearchCondition) => {
    historyHiddenFn();
    historyAdd(condition.keyword);
    onSearch?.(condition);
  };

  useImperativeHandle(ref, () => {
    return {
      keyword,
      handleSearch,
    };
  });

  useEffect(() => {
    historyHiddenFn();
  }, []);

  const inputOptions = {
    loading,
    defaultSearchLoading,
    inputProps,
    defaultValue,
    onChange: setKeyword,
    onSearch: handleSearch,
    onInputClick: handleInputClick,
    onBlur: historyHiddenFn,
  };

  return (
    <div className={classNames(styles['search-sample'])}>
      <SearchInput {...inputOptions} />
    </div>
  );
});
