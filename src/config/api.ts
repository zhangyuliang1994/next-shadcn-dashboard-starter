/**
 * API 配置文件
 * 统一管理所有后端API的基础URL，方便部署和维护
 */

// 从环境变量获取API基础URL，如果没有设置则使用默认值
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://127.0.0.1:9527/cm-simulator/api/v1';

/**
 * API 端点配置
 * 可以在这里定义所有API端点的路径
 */
export const API_ENDPOINTS = {
  // 实例管理相关
  INSTANCE: {
    QUERY_PAGE: '/instance/queryPage',
    LIST: '/instance/list',
    GET_BY_ID: (id: string | number) => `/instance/${id}`,
    ADD: '/instance/add',
    EDIT: '/instance/edit'
  },

  // 设备管理相关
  DEVICE: {
    QUERY_PAGE: '/device/queryPage'
  },

  // 站点管理相关
  STATION: {
    QUERY_PAGE: '/rcstInfo/queryPage'
  }
} as const;

/**
 * 构建完整的API URL
 * @param endpoint - API端点路径
 * @returns 完整的API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * API响应通用类型定义
 */
export interface ApiResponse<T = any> {
  data: T;
  code: string;
  msg: string;
  cause: string | null;
}

export interface PageApiResponse<T = any> {
  data: {
    total: number;
    list: T[];
  };
  code: string;
  msg: string;
  cause: string | null;
}
