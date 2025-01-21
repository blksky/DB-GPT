// import axios from 'axios';
//
// import mockApi from '../mockData';
//
// /**
//  * 通用请求接口
//  * @param url
//  * @param options
//  */
// export function request(url: string, options?: any): Promise<void> {
//   console.log('url', url);
//   const mockUrl = `${options.method || 'GET'} ${url}`;
//   if (Reflect.has(mockApi, mockUrl)) {
//     const mockData = mockApi[mockUrl];
//     if (typeof mockData === 'function') {
//       return new Promise<any>((resolve) => {
//         mockData({ body: options.data }, { json: resolve, send: resolve });
//       });
//     }
//     return Promise.resolve(mockData);
//   }
//
//   return (options.method?.toUpperCase() === 'POST'
//     ? axios.post(url, options.data, options.config)
//     : axios.get(url, options)) as any as Promise<any>;
// }

import { LOGIN_PATH } from '@/dbpages/common/constants';
import { localeMsg } from '@/dbpages/helper/LocaleHelper';
import { IApiResult, showSiteError, showSiteWarning } from '@/dbpages/typings/result';
import axios from 'axios';

const REDIRECT_HEADER = 'ajax_redirect_header';

/** 获取url参数 */
export function getSearchParams(): URLSearchParams {
  const url = new URL(`${window.location.origin}${window.location.search}`);
  return url.searchParams;
}

/** 获取登录后跳转的url */
export function getLoginReturnUrl() {
  const { origin, pathname } = window.location;
  if (pathname === LOGIN_PATH) {
    return encodeURIComponent(origin);
  }
  const searchParams = getSearchParams();
  const params = [...searchParams.keys()]
    .filter(d => d !== 'code')
    .map(d => `${d}=${searchParams.get(d)}`)
    .join('&');
  const href = `${origin}${pathname}${params.length > 0 ? `?${params}` : ''}`;
  return encodeURIComponent(href);
}

function redirectToUrl(redirect: any) {
  if (!redirect) {
    return;
  }

  const returnUrl = getLoginReturnUrl();
  if (redirect.startsWith('http')) {
    window.location.href = `${redirect}${returnUrl}`;
  } else {
    window.location.reload();
  }
  // else {
  //   window.location.href = `${window.location.origin}${Constants.LOGIN_PATH}?${Constants.LOGIN_PARAM_RETURN}=${returnUrl}`;
  // }
}

function checkStatus(response: any) {
  const redirect = response.headers.get(REDIRECT_HEADER);
  if (redirect) {
    redirectToUrl(redirect);
    return response;
  }
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.name = response.status;
  // @ts-ignore
  error.response = response;
  throw error;
}

function axiosRequest(url: string, options: Record<string, any>) {
  const result =
    options?.method?.toLowerCase() === 'post' ? axios.post(url, options.data, options.config) : axios.get(url, options);
  return result.then(checkStatus);
}

function REQUEST(url: string, options: Record<string, any>) {
  return axiosRequest(url, options)
    .then(response => response.data)
    .catch(err => {
      let errMsg = err?.message;
      if (errMsg === 'Network Error') {
        errMsg = localeMsg('operate.error.network');
        showSiteWarning({ description: errMsg });
        return;
      }
      if (!errMsg) {
        errMsg = localeMsg('operate.error.default');
      }
      showSiteError({ description: errMsg });
    });
}

/**
 * 通用请求接口
 * @param url
 * @param options
 */
export function request<T = any>(url: string, options?: any): Promise<T> {
  return REQUEST(url, options);
}

/**
 * 通用请求接口，包含code、content<T>、message
 * @param url
 * @param options
 */
export function requestApiResult<T>(url: string, options?: any): Promise<IApiResult<T>> {
  return REQUEST(url, options);
}

/**
 * 通用请求接口，但不提示错误
 * @param url
 * @param options
 */
export function requestNoError(url: string, options?: any): Promise<any> {
  return axiosRequest(url, options).then(response => response.data);
}

/**
 * 文件下载请求
 * @param url
 * @param options
 */
export function requestDownload(url: string, options?: any): Promise<any> {
  options.config = options.config || { responseType: 'blob' };
  return axiosRequest(url, options)
    .then((res: any) => {
      const disposition = res.headers['content-disposition'];
      if (!res?.data || res.status !== 200 || !disposition) {
        res.data?.text().then((text: string) => {
          const data = JSON.parse(text);
          showSiteError({
            message: localeMsg('operate.download.error'),
            description: data?.message || localeMsg('operate.download.error'),
          });
        });
        return false;
      }
      const { data, headers } = res;
      let fileName;
      if (disposition) {
        fileName = disposition.replace(/\w+;filename=(.*)/, '$1');
      } else {
        fileName = data.fileName;
      }
      const blob = new Blob([data], { type: headers['content-type'] });
      const dom = document.createElement('a');
      const downUrl = URL.createObjectURL(blob);
      dom.href = downUrl;
      dom.download = decodeURIComponent(fileName);
      dom.style.display = 'none';
      document.body.appendChild(dom);
      dom.click();
      dom.parentNode?.removeChild(dom);
      URL.revokeObjectURL(downUrl);
      return true;
    })
    .catch(err => {
      showSiteError({
        message: localeMsg('operate.download.error'),
        description: err?.message || localeMsg('operate.download.error'),
      });
      return false;
    });
}

export const QUESTION_MAP = new Map<
  string,
  { question_id?: number; db_id: string; question?: string; difficulty?: string }
>([
  [
    '1996年10月21日开卡的客户所做的最大交易金额是多少？',
    {
      question_id: 106,
      db_id: 'financial',
      question: 'What is the biggest amount of transaction that the client whose card was opened in 1996/10/21 made?',
      difficulty: 'simple',
    },
  ],
  [
    '请提供名为Atom IV的超级英雄的对立面（或阵营）和超能力。',
    {
      question_id: 811,
      db_id: 'superhero',
      question: 'Give the alignment and superpowers of the superhero named Atom IV.',
      difficulty: 'simple',
    },
  ],
  [
    '路易斯·汉密尔顿在2011年澳大利亚大奖赛的哪一圈进站了？',
    {
      question_id: 1008,
      db_id: 'formula_1',
      question: 'During which lap did Lewis Hamilton take a pit stop during the 2011 Australian Grand Prix?',
      difficulty: 'simple',
    },
  ],
  [
    '对于1996年1月3日申请了98832美元贷款的客户，他的/她的生日是什么时候？',
    {
      question_id: 113,
      db_id: 'financial',
      question: 'For the client who applied 98832 USD loan in 1996/1/3, when was his/her birthday?',
      difficulty: 'simple',
    },
  ],
  [
    '617号客户在1998年的所有交易中总共支付了多少钱？',
    {
      question_id: 179,
      db_id: 'financial',
      question: 'How much, in total, did client number 617 pay for all of the transactions in 1998?',
      difficulty: 'simple',
    },
  ],
  [
    '请提供贷款金额最大的三位女性客户的ID。',
    {
      question_id: 181,
      db_id: 'financial',
      question: 'Please provide the IDs of the 3 female clients with the largest loans.',
      difficulty: 'simple',
    },
  ],
  [
    '有多少位女性超级英雄的力量值为100？',
    {
      question_id: 740,
      db_id: 'superhero',
      question: 'How many female superheroes have a strength value of 100?',
      difficulty: 'moderate',
    },
  ],
  [
    '在主修室内设计的学生中，有哪些人参加了社区剧院活动？',
    {
      question_id: 1382,
      db_id: 'student_club',
      question: 'Among the students majored in interior design, who have attended the Community Theater event?',
      difficulty: 'moderate',
    },
  ],
  [
    '分子ID为TR006中氢元素的比例是多少？请列出比例及其标签。',
    {
      question_id: 282,
      db_id: 'toxicology',
      question: 'What is the ratio of Hydrogen elements in molecule ID TR006? List the ratio with its label.',
      difficulty: 'challenging',
    },
  ],
  [
    '在2010赛季的苏格兰超级联赛中，哪个客场球队赢得了最多的比赛？',
    {
      question_id: 1028,
      db_id: 'european_football_2',
      question: 'In Scotland Premier League, which away team won the most during the 2010 season?',
      difficulty: 'challenging',
    },
  ],
  // it_project_register_v2
  ['日本Ibaraki的G-MES的风险状态为什么是Fail？', { db_id: 'it_project_register_v2' }],
  ['今年有哪几个月没有对项目进行风险评估？', { db_id: 'it_project_register_v2' }],
  ['谁是HR领域的IT负责人？', { db_id: 'it_project_register_v2' }],
  ['工厂分布在哪几个国家和基地？', { db_id: 'it_project_register_v2' }],
  ['日本ZAMA的工厂负责人是谁？', { db_id: 'it_project_register_v2' }],
  ['中国JY01工厂在哪里？', { db_id: 'it_project_register_v2' }],
  ['现在一共哪几个IT项目在清单中？', { db_id: 'it_project_register_v2' }],
  ['一共有哪几个项目风险状态是Fail的？', { db_id: 'it_project_register_v2' }],
  ['LIMS项目的IT项目经理是谁？', { db_id: 'it_project_register_v2' }],
  ['2023年在美国启动的项目有哪些？', { db_id: 'it_project_register_v2' }],
  ['哪几个项目需要PMO监控？', { db_id: 'it_project_register_v2' }],
  ['目前日本有哪几个IT项目？', { db_id: 'it_project_register_v2' }],
  ['一共有哪几个维度来评估项目风险？', { db_id: 'it_project_register_v2' }],
]);
