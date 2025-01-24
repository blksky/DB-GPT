import { SampleSearch, SampleSearchProps } from '@/dbpages/components/SampleSearch';
import { ResultList } from '@/dbpages/components/SampleSearch/resultList';
import { useSearchStore } from '@/dbpages/components/SampleSearch/store';
import { EnumSearchActionType, ISearchCondition } from '@/dbpages/components/SampleSearch/store/ModelType';
import { Button, Drawer, Flex, Select } from 'antd';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type KnowledgeSearchProps = {
  dbOpts: any;
  resourceValue: any;
  onOk: (checkedList: { id: number; space: string; doc_name: string }[]) => void;
};

const KnowledgeSearch = forwardRef((props: KnowledgeSearchProps, ref) => {
  const { dbOpts, resourceValue } = props;
  const refResultList = useRef<any | undefined>();
  const [docSourceScope, setDocSourceScope] = useState<string>(dbOpts?.[0]?.value);
  const [fileSearchState, setFileSearchState] = useState<{
    open: boolean;
    checkedList: { id: number; space: string; doc_name: string }[];
  }>({
    open: false,
    checkedList: [],
  });
  const { searchType, setSearchType, searchData, searchCondition, setSearchCondition, fetchSearchResult, checkedList } =
    useSearchStore();

  useEffect(() => {
    if (dbOpts?.some((d: any) => d.value === resourceValue)) {
      setDocSourceScope(resourceValue);
    } else {
      setDocSourceScope(dbOpts?.[0]?.value);
    }
  }, [dbOpts, resourceValue]);

  useEffect(() => {
    setSearchCondition({
      ...searchCondition,
      values: {
        ...(searchCondition.values || {}),
        space_name: docSourceScope,
      },
    });
  }, [docSourceScope]);

  const handleSelectChange = (value: any) => {
    setDocSourceScope(value);
  };

  const handleSearch = (cond: ISearchCondition) => {
    setSearchCondition(cond);
    fetchSearchResult(searchCondition, EnumSearchActionType.SEARCH);
  };

  const handleFileSearchOk = () => {
    setFileSearchState({ open: false, checkedList: [] });
    props.onOk([...checkedList]);
  };

  useImperativeHandle(ref, () => {
    return {
      showSearch: () => setFileSearchState({ open: true, checkedList: [] }),
    };
  });

  useEffect(() => {
    useSearchStore.setState({
      checkedList: [...fileSearchState.checkedList],
    });
  }, [fileSearchState.checkedList]);

  const searchOption: SampleSearchProps = {
    searchType,
    showType: false,
    loading: searchData.loading,
    defaultValue: searchCondition,
    onSearch: handleSearch,
    onSearchType: value => {
      setSearchType(value);
      handleSearch({ ...searchCondition, searchType: value });
    },
    inputProps: {
      prefix: (
        <Select
          value={docSourceScope}
          options={dbOpts?.map((d: any) => ({ label: d.value, value: d.value }))}
          className='filter-select'
          onChange={handleSelectChange}
          onClick={e => e.stopPropagation()}
        />
      ),
    },
    defaultSearchLoading: false,
  };

  return (
    <Drawer
      width='100%'
      title='知识库文件选择'
      open={fileSearchState.open}
      bodyStyle={{ background: '#f5f5f5' }}
      onClose={() => setFileSearchState({ open: false, checkedList: [] })}
      extra={
        <Button onClick={handleFileSearchOk} type='primary'>
          确定
        </Button>
      }
    >
      <Flex vertical={true} align='center'>
        <div style={{ width: 700 }}>
          <SampleSearch {...searchOption} />
        </div>
        <div style={{ width: 1000 }}>
          <ResultList ref={refResultList} />
        </div>
      </Flex>
    </Drawer>
  );
});

export default memo(KnowledgeSearch);
