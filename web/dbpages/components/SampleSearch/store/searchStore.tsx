import { Constants } from '@/dbpages/components/Chat/helper/Constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import * as CommonUtil from '@/dbpages/utils/CommonUtil';
import { create } from 'zustand';
import {
  EnumSearchActionType,
  IMainTypeData,
  IPageSampleData,
  ISearchCondition,
  ISearchData,
  ResultWrapper,
  getPagerByActionType,
  setPagerByActionType,
  setPagerByActionTypeBeforeQuery,
} from './ModelType';
import { fulltextQuery, searchPrompt } from './searchService';

interface ISearchDataState {
  mainTypeState: { loading: boolean; list?: IMainTypeData[] };
  promptList: { label: any; value: string }[];
  searchType?: string | any;
  searchData: IPageSampleData<ISearchData>;
  searchCondition: ISearchCondition;
  historyShow: boolean;
  historyList: any[];
  defaultSearchLoading: boolean;
  checkedList: { id: number; space: string; doc_name: string }[];
}

/**
 * 全文检索
 */
export interface ISearchState extends ISearchDataState {
  setSearchType: (data?: string | any) => void;
  setSearchData: (data: IPageSampleData<ISearchData>) => void;
  panelShowFn: () => void;
  panelHiddenFn: () => void;
  historyShowFn: () => void;
  historyHiddenFn: () => void;
  historyDelete: () => void;
  historyAdd: (str: string | undefined) => void;
  setSearchCondition: (data: ISearchCondition) => void;
  fetchSearchPrompt: (keyword: string) => Promise<void>;
  fetchSearchResult: (payload: ISearchCondition, actionType: EnumSearchActionType) => Promise<Record<string, any>>;
  clearPageState: () => Promise<void>;
}
const getDefaultSearchState = (): ISearchDataState => {
  return {
    promptList: [],
    mainTypeState: { loading: false },
    defaultSearchLoading: true,
    searchData: {
      loading: false,
      keyword: '',
      list: [],
      pagination: {
        current: 1,
        pageSize: Constants.DEFAULT_PAGE_SIZE,
        showTotal: (total: number) => localeMsg('pages.total.rows', { total }),
      },
    },
    searchType: undefined,
    searchCondition: {},
    historyShow: false,
    historyList: CommonUtil.getHistoryList(),
    checkedList: [],
  };
};

export const useSearchStore = create<ISearchState>((set, get) => {
  return {
    ...getDefaultSearchState(),
    setSearchType: data => set({ searchType: data }),
    historyShowFn: () => {
      set({ historyShow: true });
    },
    historyHiddenFn: () => {
      set({ historyShow: false });
    },
    historyDelete: () => {
      CommonUtil.clearHistoryList();
      set({ historyList: [] });
    },
    historyAdd: str => {
      if (str) {
        const { historyList } = get();
        const arr = [...new Set([str, ...historyList])].slice(0, 10);
        set({ historyList: arr });
        CommonUtil.setHistoryList(arr);
      }
    },
    setSearchData: data => set({ searchData: data }),
    setSearchCondition: (data: ISearchCondition) => set({ searchCondition: data, searchType: data.searchType }),
    fetchSearchPrompt: async (keyword: string): Promise<void> => {
      const value = keyword?.trim() || '';
      const data = await searchPrompt({ keyword: value });
      ResultWrapper<any>({
        data,
        onSuccess: content => {
          set({
            promptList: (content || []).map((d: string, keyIndex: any) => {
              const label: any[] = [];
              const splitArray = d.split(value);
              splitArray.forEach((item, index) => {
                if (index < splitArray.length - 1) {
                  label.push(
                    <span key={index}>
                      {item}
                      <em>{value}</em>
                    </span>,
                  );
                } else {
                  label.push(<span key={index}>{item}</span>);
                }
              });
              return { value: d, label: <span>{label}</span>, key: keyIndex };
            }),
          });
        },
      });
    },
    fetchSearchResult: async (
      payload: ISearchCondition,
      actionType: EnumSearchActionType,
    ): Promise<Record<string, any>> => {
      const { searchData } = get();
      const { isLoadMore, pageIndex, pageSize } = getPagerByActionType(payload, actionType, searchData.list);
      const updateState = { ...searchData, loading: !isLoadMore };
      setPagerByActionTypeBeforeQuery({ pageIndex, pageSize }, updateState, actionType);
      set({ searchData: updateState, searchCondition: payload, searchType: payload.searchType, checkedList: [] });
      const startTime = +new Date();
      const data = await fulltextQuery({
        ...payload,
        pageIndex,
        pageSize,
        values: payload.values,
        keyword: payload.keyword,
        searchType: payload.searchType,
      });
      updateState.loading = false;
      updateState.time = +new Date() - startTime;
      ResultWrapper<typeof data>({
        data,
        onSuccess: content => {
          setPagerByActionType(content, updateState, actionType);
          set({ searchData: updateState });
        },
        onError: () => {
          const newSearchData = {
            ...searchData,
            loading: false,
            keyword: '',
            list: [],
            pagination: {
              ...searchData.pagination,
              total: 0,
            },
          };
          set({ searchData: newSearchData });
        },
      });
      return { condition: payload, list: updateState.list };
    },
    clearPageState: async (): Promise<void> => {
      set(getDefaultSearchState());
    },
  };
});
