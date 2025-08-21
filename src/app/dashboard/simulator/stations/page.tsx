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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconRefresh,
  IconLoader2,
  IconChevronRight,
  IconServer,
  IconSearch,
  IconMapPin
} from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';

// API响应数据类型定义
interface ApiResponse<T> {
  data: T;
  code: string;
  msg: string;
  cause: string | null;
}

interface StationApiResponse {
  data: {
    total: number;
    list: SimulatorStation[];
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

interface SimulatorStation {
  id: number;
  instanceId: number;
  mac: string | null;
  terminalNo: number | null;
  code: string | null;
  gateway: string | null;
  ip: string | null;
  mask: string | null;
  model: string | null;
  version: string | null;
  modemLon: number;
  modemLonDir: number;
  modemLat: number;
  modemLatDir: number;
  sateLon: number;
  sateLonDir: number;
  sateLat: number;
  sateLatDir: number;
  height: number;
  createTime: string;
  updateTime: string;
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

const fetchStations = async (
  pageNum: number,
  pageSize: number,
  instanceId?: number
): Promise<StationApiResponse> => {
  const requestBody: any = {
    pageNum,
    pageSize
  };

  // 只有选择了实例时才传递instanceId
  if (instanceId !== undefined) {
    requestBody.instanceId = instanceId;
  }

  const response = await fetch('/api/simulator/stations', {
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

export default function StationManagementPage() {
  // 实例相关状态
  const [allInstances, setAllInstances] = useState<SimulatorInstance[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(true);
  const [instancesError, setInstancesError] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // 小站相关状态
  const [stations, setStations] = useState<SimulatorStation[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [stationCurrentPage, setStationCurrentPage] = useState(1);
  const [stationPageSize] = useState(10);
  const [stationTotal, setStationTotal] = useState(0);

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

  // 加载小站数据
  const loadStations = async (page: number = 1, instanceId?: number) => {
    try {
      setStationsLoading(true);
      setStationsError(null);
      const response = await fetchStations(page, stationPageSize, instanceId);

      if (response.code === '200') {
        setStations(response.data.list);
        setStationTotal(response.data.total);
        setStationCurrentPage(page);
      } else {
        setStationsError(response.msg || '加载小站数据失败');
        setStations([]);
        setStationTotal(0);
      }
    } catch (err) {
      setStationsError(err instanceof Error ? err.message : '网络请求失败');
      setStations([]);
      setStationTotal(0);
    } finally {
      setStationsLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadInstances();
    // 默认加载所有小站
    loadStations();
  }, []);

  // 处理实例选择
  const handleInstanceSelect = (instanceId: number | null) => {
    setSelectedInstanceId(instanceId);
    setStationCurrentPage(1);
    loadStations(1, instanceId || undefined);
  };

  // 处理分页
  const handleStationPageChange = (page: number) => {
    loadStations(page, selectedInstanceId || undefined);
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
  };

  // 获取在线状态
  const getOnlineStatus = (ip: string | null) => {
    return ip ? '在线' : '离线';
  };

  // 格式化坐标
  const formatCoordinate = (
    value: number,
    direction: number,
    type: 'lon' | 'lat'
  ) => {
    const dirText =
      type === 'lon'
        ? direction === 0
          ? 'E'
          : 'W'
        : direction === 0
          ? 'N'
          : 'S';
    return `${Math.abs(value).toFixed(4)}°${dirText}`;
  };

  // 计算分页信息
  const stationTotalPages = Math.ceil(stationTotal / stationPageSize);

  return (
    <div className='flex w-full flex-col'>
      <div className='flex-none px-6 py-6'>
        {/* 页面头部 */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>小站管理</h1>
              <p className='text-muted-foreground mt-1'>
                查看和管理终端小站设备信息
              </p>
            </div>
            <Button
              onClick={() => {
                loadInstances();
                loadStations(
                  stationCurrentPage,
                  selectedInstanceId || undefined
                );
              }}
              disabled={instancesLoading || stationsLoading}
            >
              {instancesLoading || stationsLoading ? (
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <IconRefresh className='mr-2 h-4 w-4' />
              )}
              {instancesLoading || stationsLoading ? '加载中...' : '刷新数据'}
            </Button>
          </div>
        </div>
      </div>

      <div className='flex-1 px-6 pb-6'>
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
                  搜索或选择实例查看对应小站
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-0'>
                {/* 搜索输入框 */}
                <div className='mb-4 flex-shrink-0'>
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
                  <div className='mb-3 flex-shrink-0 rounded border border-red-200 bg-red-50 p-2 text-xs'>
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
                    {/* 全部小站选项 */}
                    <div
                      className={`mb-1 flex cursor-pointer items-center rounded px-2 py-2 text-sm transition-colors ${
                        selectedInstanceId === null
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleInstanceSelect(null)}
                    >
                      <IconChevronRight className='text-muted-foreground mr-1 h-3 w-3' />
                      <span className='font-medium'>全部小站</span>
                      <Badge
                        variant='outline'
                        className='ml-auto scale-90 text-xs'
                      >
                        {stationTotal}
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

          {/* 右侧：小站列表 (4/5 宽度) */}
          <div className='lg:col-span-4'>
            <Card className='flex flex-col'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg'>终端小站设备</CardTitle>
                    <CardDescription className='mt-1'>
                      {selectedInstanceId
                        ? stationsLoading
                          ? '正在加载小站数据...'
                          : `实例 ${allInstances.find((i) => i.id === selectedInstanceId)?.httpIp || selectedInstanceId} 的小站（共 ${stationTotal} 个）`
                        : stationsLoading
                          ? '正在加载小站数据...'
                          : `全部小站（共 ${stationTotal} 个）`}
                    </CardDescription>
                  </div>
                  {!stationsLoading && stationTotal > 0 && (
                    <Badge variant='outline' className='text-sm'>
                      {stationTotal} 个小站
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='px-6'>
                {/* 错误提示 */}
                {stationsError && (
                  <div className='mb-4 flex-shrink-0 rounded-md border border-red-200 bg-red-50 p-3'>
                    <p className='text-sm text-red-600'>
                      ❌ 错误：{stationsError}
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-2'
                      onClick={() =>
                        loadStations(
                          stationCurrentPage,
                          selectedInstanceId || undefined
                        )
                      }
                    >
                      重试
                    </Button>
                  </div>
                )}

                {stationsLoading ? (
                  <div className='flex flex-1 items-center justify-center py-12'>
                    <IconLoader2 className='mr-3 h-8 w-8 animate-spin' />
                    <span className='text-lg'>正在加载小站数据...</span>
                  </div>
                ) : stations.length === 0 ? (
                  <div className='flex flex-1 items-center justify-center py-12 text-center'>
                    <p className='text-muted-foreground text-lg'>
                      {selectedInstanceId
                        ? '该实例暂无小站设备'
                        : '暂无小站设备'}
                    </p>
                  </div>
                ) : (
                  <div className='flex min-h-0 flex-1 flex-col'>
                    <>
                      <Tabs defaultValue='basic' className='w-full'>
                        <TabsList>
                          <TabsTrigger value='basic'>基本信息</TabsTrigger>
                          <TabsTrigger value='network'>网络配置</TabsTrigger>
                          <TabsTrigger value='location'>位置信息</TabsTrigger>
                        </TabsList>

                        <TabsContent value='basic' className='space-y-4'>
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
                                  <TableHead className='w-[120px] font-semibold'>
                                    终端编号
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    小站代码
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    设备型号
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    版本
                                  </TableHead>
                                  <TableHead className='w-[100px] font-semibold'>
                                    状态
                                  </TableHead>
                                  <TableHead className='w-[120px] text-center font-semibold'>
                                    操作
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stations.map((station) => (
                                  <TableRow
                                    key={station.id}
                                    className='hover:bg-muted/50'
                                  >
                                    <TableCell className='font-medium'>
                                      #{station.id}
                                    </TableCell>
                                    <TableCell>
                                      <code className='bg-muted rounded px-2 py-1 text-xs'>
                                        {allInstances.find(
                                          (i) => i.id === station.instanceId
                                        )?.httpIp || station.instanceId}
                                      </code>
                                    </TableCell>
                                    <TableCell>
                                      <code className='bg-muted rounded px-2 py-1 text-sm'>
                                        {station.terminalNo || '-'}
                                      </code>
                                    </TableCell>
                                    <TableCell>
                                      <span className='text-sm'>
                                        {station.code || '-'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className='text-sm'>
                                        {station.model || '-'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <span className='text-sm'>
                                        {station.version || '-'}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          station.ip ? 'default' : 'secondary'
                                        }
                                        className='text-xs'
                                      >
                                        {getOnlineStatus(station.ip)}
                                      </Badge>
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
                        </TabsContent>

                        <TabsContent value='network' className='space-y-4'>
                          <div className='rounded-md border'>
                            <Table>
                              <TableHeader>
                                <TableRow className='hover:bg-transparent'>
                                  <TableHead className='font-semibold'>
                                    小站代码
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    MAC地址
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    IP地址
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    子网掩码
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    网关
                                  </TableHead>
                                  <TableHead className='w-[100px] font-semibold'>
                                    状态
                                  </TableHead>
                                  <TableHead className='w-[120px] text-center font-semibold'>
                                    操作
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stations.map((station) => (
                                  <TableRow
                                    key={station.id}
                                    className='hover:bg-muted/50'
                                  >
                                    <TableCell className='font-medium'>
                                      {station.code || '-'}
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {station.mac || '-'}
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {station.ip || '-'}
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {station.mask || '-'}
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {station.gateway || '-'}
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant={
                                          station.ip ? 'default' : 'secondary'
                                        }
                                        className='text-xs'
                                      >
                                        {getOnlineStatus(station.ip)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className='text-center'>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='text-xs'
                                      >
                                        诊断
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        <TabsContent value='location' className='space-y-4'>
                          <div className='rounded-md border'>
                            <Table>
                              <TableHeader>
                                <TableRow className='hover:bg-transparent'>
                                  <TableHead className='font-semibold'>
                                    小站代码
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    调制解调器位置
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    卫星位置
                                  </TableHead>
                                  <TableHead className='font-semibold'>
                                    卫星高度 (km)
                                  </TableHead>
                                  <TableHead className='w-[120px] text-center font-semibold'>
                                    操作
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {stations.map((station) => (
                                  <TableRow
                                    key={station.id}
                                    className='hover:bg-muted/50'
                                  >
                                    <TableCell className='font-medium'>
                                      {station.code || '-'}
                                    </TableCell>
                                    <TableCell>
                                      <div className='flex items-center gap-1'>
                                        <IconMapPin className='text-muted-foreground h-4 w-4' />
                                        <span className='font-mono text-sm'>
                                          {formatCoordinate(
                                            station.modemLat,
                                            station.modemLatDir,
                                            'lat'
                                          )}
                                          ,{' '}
                                          {formatCoordinate(
                                            station.modemLon,
                                            station.modemLonDir,
                                            'lon'
                                          )}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className='flex items-center gap-1'>
                                        <IconMapPin className='text-muted-foreground h-4 w-4' />
                                        <span className='font-mono text-sm'>
                                          {formatCoordinate(
                                            station.sateLat,
                                            station.sateLatDir,
                                            'lat'
                                          )}
                                          ,{' '}
                                          {formatCoordinate(
                                            station.sateLon,
                                            station.sateLonDir,
                                            'lon'
                                          )}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className='font-mono text-sm'>
                                      {station.height.toLocaleString()}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                      <Button
                                        variant='outline'
                                        size='sm'
                                        className='text-xs'
                                      >
                                        地图
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* 小站分页控件 */}
                      {stationTotalPages > 1 && (
                        <div className='mt-6 flex items-center justify-between border-t pt-4'>
                          <div className='text-muted-foreground text-sm'>
                            显示第{' '}
                            <strong>
                              {(stationCurrentPage - 1) * stationPageSize + 1}
                            </strong>{' '}
                            -{' '}
                            <strong>
                              {Math.min(
                                stationCurrentPage * stationPageSize,
                                stationTotal
                              )}
                            </strong>{' '}
                            条，共 <strong>{stationTotal}</strong> 条记录
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              disabled={stationCurrentPage === 1}
                              onClick={() =>
                                handleStationPageChange(stationCurrentPage - 1)
                              }
                            >
                              ← 上一页
                            </Button>
                            <div className='flex items-center space-x-1'>
                              <span className='text-muted-foreground text-sm'>
                                第
                              </span>
                              <Badge variant='outline' className='px-2'>
                                {stationCurrentPage}
                              </Badge>
                              <span className='text-muted-foreground text-sm'>
                                页 / 共
                              </span>
                              <Badge variant='outline' className='px-2'>
                                {stationTotalPages}
                              </Badge>
                              <span className='text-muted-foreground text-sm'>
                                页
                              </span>
                            </div>
                            <Button
                              variant='outline'
                              size='sm'
                              disabled={
                                stationCurrentPage === stationTotalPages
                              }
                              onClick={() =>
                                handleStationPageChange(stationCurrentPage + 1)
                              }
                            >
                              下一页 →
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
