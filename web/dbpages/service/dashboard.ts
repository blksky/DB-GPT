import { DELETE, GET, POST } from '@/client/api';
import { IChartItem, IDashboardItem, IPageResponse } from '@/dbpages/typings/index';
import createRequest from './base';

/** 获取报表列表 */
// const getDashboardList = createRequest<{}, IPageResponse<IDashboardItem>>('/api/v1/conv/dashboard/list', {
//   method: 'get',
// });

const getDashboardList = (data: any) => {
  return GET<any, IPageResponse<IDashboardItem>>('/api/v1/conv/dashboard/list', data);
};

// const getDashboardById = createRequest<{ id: number }, IDashboardItem>('/api/v1/conv/dashboard/query', {
//   method: 'post',
// });

const getDashboardById = (data: { id: number }) => {
  return POST<{ id: number }, IDashboardItem>(`/api/v1/conv/dashboard/query`, data);
};

// /** 创建报表 */
// const createDashboard = createRequest<{ name: string; description: string; schema?: string; chartId?: number[] }, void>(
//   '/api/v1/conv/dashboard/add',
//   { method: 'post' },
// );

/** 创建报表 */
const createDashboard = (data: { name: string; description: string; schema?: string; chartId?: number[] }) => {
  return POST<{ name: string; description: string; schema?: string; chartId?: number[] }, void>(
    '/api/v1/conv/dashboard/add',
    data,
  );
};

/** 更新报表 */
// const updateDashboard = createRequest<IDashboardItem, void>('/api/v1/conv/dashboard/update', {
//   method: 'post',
// });
/** 更新报表 */
const updateDashboard = (data: IDashboardItem) => {
  return POST<IDashboardItem, void>('/api/v1/conv/dashboard/update', data);
};
// /** 删除报表 */
// const deleteDashboard = createRequest<{ id: number }, string>('/api/v1/conv/dashboard/delete', {
//   method: 'delete',
// });
/** 删除报表 */
const deleteDashboard = (data: { id: number }) => {
  return DELETE<{ id: number }, string>('/api/v1/conv/dashboard/delete', data);
};

/** 根据id 查询图表详情 */
const getChartById = createRequest<{ id: number }, IChartItem>('/api/chart/:id', { method: 'get' });
/** 创建图表 */
const createChart = createRequest<IChartItem, number>('/api/chart/create', { method: 'post' });
/** 更新图表 */
const updateChart = createRequest<IChartItem, void>('/api/chart/update', { method: 'post' });
/** 删除图表 */
const deleteChart = createRequest<{ id: number }, string>('/api/chart/:id', { method: 'delete' });

export {
  createChart,
  createDashboard,
  deleteChart,
  deleteDashboard,
  getChartById,
  getDashboardById,
  getDashboardList,
  updateChart,
  updateDashboard,
};
