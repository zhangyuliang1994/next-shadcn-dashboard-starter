'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconRefresh,
  IconLoader2,
  IconChevronRight,
  IconServer,
  IconSearch
} from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';

// API响应数据类型定义
interface ApiResponse<T> {
  data: T;
  code: string;
  msg: string;
  cause: string | null;
}

interface DeviceApiResponse {
  data: {
    total: number;
    list: SimulatorDevice[];
  };
  code: string;
  msg: string;
  cause: string | null;
}

interface SimulatorInstance {
  id: number;
  httpPort: number | null;
  httpIp: string;
  enable: boolean;
  remark: string | null;
  createTime: string;
  updateTime: string | null;
}

interface SimulatorDevice {
  id: number;
  instanceId: number;
  device: number;
  version: string | null;
  state: string | null;
  remark: string | null;
  createTime: string;
  updateTime: string | null;
}

// API调用函数
const fetchInstanceList = async (): Promise<
  ApiResponse<SimulatorInstance[]>
> => {
  const response = await fetch('/api/simulator/instance-list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const fetchDevices = async (
  pageNum: number,
  pageSize: number,
  instanceId?: number
): Promise<DeviceApiResponse> => {
  const requestBody: any = {
    pageNum,
    pageSize
  };

  // 只有选择了实例时才传递instanceId
  if (instanceId !== undefined) {
    requestBody.instanceId = instanceId;
  }

  const response = await fetch('/api/simulator/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export default function DeviceManagementPage() {
  // 实例相关状态
  const [allInstances, setAllInstances] = useState<SimulatorInstance[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(true);
  const [instancesError, setInstancesError] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // 设备相关状态
  const [devices, setDevices] = useState<SimulatorDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [deviceCurrentPage, setDeviceCurrentPage] = useState(1);
  const [devicePageSize] = useState(10);
  const [deviceTotal, setDeviceTotal] = useState(0);

  // 根据搜索查询过滤实例
  const filteredInstances = useMemo(() => {
    if (!searchQuery.trim()) {
      return allInstances;
    }

    return allInstances.filter((instance) =>
      instance.httpIp.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [allInstances, searchQuery]);

  // 加载实例数据
  const loadInstances = async () => {
    try {
      setInstancesLoading(true);
      setInstancesError(null);
      const response = await fetchInstanceList();

      if (response.code === '200') {
        setAllInstances(response.data);
      } else {
        setInstancesError(response.msg || '加载实例数据失败');
        setAllInstances([]);
      }
    } catch (err) {
      setInstancesError(err instanceof Error ? err.message : '网络请求失败');
      setAllInstances([]);
    } finally {
      setInstancesLoading(false);
    }
  };

  // 加载设备数据
  const loadDevices = async (page: number = 1, instanceId?: number) => {
    try {
      setDevicesLoading(true);
      setDevicesError(null);
      const response = await fetchDevices(page, devicePageSize, instanceId);

      if (response.code === '200') {
        setDevices(response.data.list);
        setDeviceTotal(response.data.total);
        setDeviceCurrentPage(page);
      } else {
        setDevicesError(response.msg || '加载设备数据失败');
        setDevices([]);
        setDeviceTotal(0);
      }
    } catch (err) {
      setDevicesError(err instanceof Error ? err.message : '网络请求失败');
      setDevices([]);
      setDeviceTotal(0);
    } finally {
      setDevicesLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadInstances();
    // 默认加载所有设备
    loadDevices();
  }, []);

  // 处理实例选择
  const handleInstanceSelect = (instanceId: number | null) => {
    setSelectedInstanceId(instanceId);
    setDeviceCurrentPage(1);
    loadDevices(1, instanceId || undefined);
  };

  // 处理分页
  const handleDevicePageChange = (page: number) => {
    loadDevices(page, selectedInstanceId || undefined);
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
  };

  // 获取状态变体样式
  const getStateVariant = (state: string | null) => {
    switch (state) {
      case 'ON_LINE':
        return 'default';
      case 'OFF_LINE':
        return 'secondary';
      case 'MAINTENANCE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // 获取状态显示文本
  const getStateText = (state: string | null) => {
    switch (state) {
      case 'ON_LINE':
        return '在线';
      case 'OFF_LINE':
        return '离线';
      case 'MAINTENANCE':
        return '维护中';
      default:
        return '未知';
    }
  };

  // 计算分页信息
  const deviceTotalPages = Math.ceil(deviceTotal / devicePageSize);

  return (
    <div className='container mx-auto py-6'>
      {/* 页面头部 */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>主站板卡管理</h1>
            <p className='text-muted-foreground mt-1'>
              查看和管理主站板卡设备信息
            </p>
          </div>
          <Button
            onClick={() => {
              loadInstances();
              loadDevices(deviceCurrentPage, selectedInstanceId || undefined);
            }}
            disabled={instancesLoading || devicesLoading}
          >
            {instancesLoading || devicesLoading ? (
              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <IconRefresh className='mr-2 h-4 w-4' />
            )}
            {instancesLoading || devicesLoading ? '加载中...' : '刷新数据'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
        {/* 左侧：实例搜索和列表 (1/5 宽度) */}
        <div className='lg:col-span-1'>
          <Card className='h-fit'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center text-base'>
                <IconServer className='mr-2 h-4 w-4' />
                实例筛选
              </CardTitle>
              <CardDescription className='text-xs'>
                搜索或选择实例查看对应设备
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-0'>
              {/* 搜索输入框 */}
              <div className='mb-4'>
                <div className='relative'>
                  <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                  <Input
                    placeholder='输入 IP 地址搜索...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className='h-9 pl-10 text-sm'
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform'
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* 错误提示 */}
              {instancesError && (
                <div className='mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs'>
                  <p className='text-red-600'>错误：{instancesError}</p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-1 h-6 text-xs'
                    onClick={loadInstances}
                  >
                    重试
                  </Button>
                </div>
              )}

              {instancesLoading ? (
                <div className='flex items-center justify-center py-4'>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  <span className='text-xs'>加载中...</span>
                </div>
              ) : (
                <>
                  {/* 全部设备选项 */}
                  <div
                    className={`mb-1 flex cursor-pointer items-center rounded px-2 py-2 text-sm transition-colors ${
                      selectedInstanceId === null
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleInstanceSelect(null)}
                  >
                    <IconChevronRight className='text-muted-foreground mr-1 h-3 w-3' />
                    <span className='font-medium'>全部设备</span>
                    <Badge
                      variant='outline'
                      className='ml-auto scale-90 text-xs'
                    >
                      {deviceTotal}
                    </Badge>
                  </div>

                  {/* 实例列表 */}
                  <div className='max-h-96 space-y-1 overflow-y-auto'>
                    {filteredInstances.length === 0 ? (
                      <div className='py-4 text-center'>
                        <p className='text-muted-foreground text-xs'>
                          {searchQuery ? '没有匹配的实例' : '暂无实例数据'}
                        </p>
                      </div>
                    ) : (
                      filteredInstances.map((instance) => (
                        <div
                          key={instance.id}
                          className={`flex cursor-pointer items-center rounded px-2 py-1.5 text-sm transition-colors ${
                            selectedInstanceId === instance.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleInstanceSelect(instance.id)}
                        >
                          <IconChevronRight className='text-muted-foreground mr-1 h-3 w-3 flex-shrink-0' />
                          <span className='flex-1 truncate'>
                            {instance.httpIp || `实例 #${instance.id}`}
                          </span>
                          <div className='ml-1 flex items-center space-x-1'>
                            {!instance.enable && (
                              <Badge
                                variant='secondary'
                                className='scale-75 text-xs'
                              >
                                禁用
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 搜索结果统计 */}
                  {searchQuery && (
                    <div className='text-muted-foreground mt-3 border-t pt-3 text-xs'>
                      找到 {filteredInstances.length} 个实例
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：主站板卡列表 (4/5 宽度) */}
        <div className='lg:col-span-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>主站板卡设备</CardTitle>
                  <CardDescription className='mt-1'>
                    {selectedInstanceId
                      ? devicesLoading
                        ? '正在加载设备数据...'
                        : `实例 ${allInstances.find((i) => i.id === selectedInstanceId)?.httpIp || selectedInstanceId} 的设备（共 ${deviceTotal} 个）`
                      : devicesLoading
                        ? '正在加载设备数据...'
                        : `全部设备（共 ${deviceTotal} 个）`}
                  </CardDescription>
                </div>
                {!devicesLoading && deviceTotal > 0 && (
                  <Badge variant='outline' className='text-sm'>
                    {deviceTotal} 个设备
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* 错误提示 */}
              {devicesError && (
                <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3'>
                  <p className='text-sm text-red-600'>
                    ❌ 错误：{devicesError}
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    className='mt-2'
                    onClick={() =>
                      loadDevices(
                        deviceCurrentPage,
                        selectedInstanceId || undefined
                      )
                    }
                  >
                    重试
                  </Button>
                </div>
              )}

              {devicesLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <IconLoader2 className='mr-3 h-8 w-8 animate-spin' />
                  <span className='text-lg'>正在加载设备数据...</span>
                </div>
              ) : devices.length === 0 ? (
                <div className='py-12 text-center'>
                  <p className='text-muted-foreground text-lg'>
                    {selectedInstanceId ? '该实例暂无板卡设备' : '暂无板卡设备'}
                  </p>
                </div>
              ) : (
                <>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                          <TableHead className='w-[80px] font-semibold'>
                            ID
                          </TableHead>
                          <TableHead className='w-[100px] font-semibold'>
                            实例
                          </TableHead>
                          <TableHead className='w-[100px] font-semibold'>
                            设备ID
                          </TableHead>
                          <TableHead className='font-semibold'>版本</TableHead>
                          <TableHead className='w-[100px] font-semibold'>
                            状态
                          </TableHead>
                          <TableHead className='font-semibold'>备注</TableHead>
                          <TableHead className='w-[180px] font-semibold'>
                            创建时间
                          </TableHead>
                          <TableHead className='w-[120px] text-center font-semibold'>
                            操作
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devices.map((device) => (
                          <TableRow
                            key={device.id}
                            className='hover:bg-muted/50'
                          >
                            <TableCell className='font-medium'>
                              #{device.id}
                            </TableCell>
                            <TableCell>
                              <code className='bg-muted rounded px-2 py-1 text-xs'>
                                {allInstances.find(
                                  (i) => i.id === device.instanceId
                                )?.httpIp || device.instanceId}
                              </code>
                            </TableCell>
                            <TableCell>
                              <code className='bg-muted rounded px-2 py-1 text-sm'>
                                {device.device}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className='text-sm'>
                                {device.version || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStateVariant(device.state)}
                                className='text-xs'
                              >
                                {getStateText(device.state)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className='text-sm'>
                                {device.remark || (
                                  <span className='text-muted-foreground'>
                                    无备注
                                  </span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className='text-muted-foreground text-sm'>
                                {device.createTime}
                              </span>
                            </TableCell>
                            <TableCell className='text-center'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-xs'
                              >
                                管理
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 设备分页控件 */}
                  {deviceTotalPages > 1 && (
                    <div className='mt-6 flex items-center justify-between border-t pt-4'>
                      <div className='text-muted-foreground text-sm'>
                        显示第{' '}
                        <strong>
                          {(deviceCurrentPage - 1) * devicePageSize + 1}
                        </strong>{' '}
                        -{' '}
                        <strong>
                          {Math.min(
                            deviceCurrentPage * devicePageSize,
                            deviceTotal
                          )}
                        </strong>{' '}
                        条，共 <strong>{deviceTotal}</strong> 条记录
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={deviceCurrentPage === 1}
                          onClick={() =>
                            handleDevicePageChange(deviceCurrentPage - 1)
                          }
                        >
                          ← 上一页
                        </Button>
                        <div className='flex items-center space-x-1'>
                          <span className='text-muted-foreground text-sm'>
                            第
                          </span>
                          <Badge variant='outline' className='px-2'>
                            {deviceCurrentPage}
                          </Badge>
                          <span className='text-muted-foreground text-sm'>
                            页 / 共
                          </span>
                          <Badge variant='outline' className='px-2'>
                            {deviceTotalPages}
                          </Badge>
                          <span className='text-muted-foreground text-sm'>
                            页
                          </span>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={deviceCurrentPage === deviceTotalPages}
                          onClick={() =>
                            handleDevicePageChange(deviceCurrentPage + 1)
                          }
                        >
                          下一页 →
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
