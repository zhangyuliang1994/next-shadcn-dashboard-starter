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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { IconRefresh, IconLoader2 } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

// API响应数据类型定义
interface ApiResponse<T> {
  data: {
    total: number;
    list: T[];
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

// API调用函数
const fetchInstances = async (
  pageNum: number,
  pageSize: number
): Promise<ApiResponse<SimulatorInstance>> => {
  const response = await fetch('/api/simulator/instances', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pageNum,
      pageSize
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export default function InstanceManagementPage() {
  const [instances, setInstances] = useState<SimulatorInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 加载实例数据
  const loadInstances = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchInstances(page, pageSize);

      if (response.code === '200') {
        setInstances(response.data.list);
        setTotal(response.data.total);
      } else {
        setError(response.msg || '加载数据失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadInstances();
  }, [currentPage]);

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 计算分页信息
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='container mx-auto py-6'>
      {/* 页面头部 */}
      <div className='mb-8'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>实例管理</h1>
            <p className='text-muted-foreground mt-1'>
              管理和查看模拟器实例信息
            </p>
          </div>
          <Button onClick={() => loadInstances()} disabled={loading}>
            {loading ? (
              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <IconRefresh className='mr-2 h-4 w-4' />
            )}
            {loading ? '加载中...' : '刷新数据'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className='mb-6 border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <p className='text-red-600'>❌ 错误：{error}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => loadInstances()}
              >
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 实例列表卡片 */}
      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-xl'>模拟器实例列表</CardTitle>
              <CardDescription className='mt-1'>
                {loading
                  ? '正在加载数据...'
                  : `当前显示第 ${currentPage} 页，共 ${totalPages} 页，总计 ${total} 个实例`}
              </CardDescription>
            </div>
            {!loading && total > 0 && (
              <Badge variant='outline' className='text-sm'>
                {total} 个实例
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <IconLoader2 className='mr-3 h-8 w-8 animate-spin' />
              <span className='text-lg'>正在加载实例数据...</span>
            </div>
          ) : instances.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='text-muted-foreground text-lg'>暂无实例数据</p>
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
                      <TableHead className='font-semibold'>
                        HTTP IP地址
                      </TableHead>
                      <TableHead className='w-[120px] font-semibold'>
                        HTTP端口
                      </TableHead>
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
                    {instances.map((instance) => (
                      <TableRow key={instance.id} className='hover:bg-muted/50'>
                        <TableCell className='font-medium'>
                          #{instance.id}
                        </TableCell>
                        <TableCell>
                          <code className='bg-muted rounded px-2 py-1 text-sm'>
                            {instance.httpIp || '未配置'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {instance.httpPort ? (
                            <code className='bg-muted rounded px-2 py-1 text-sm'>
                              {instance.httpPort}
                            </code>
                          ) : (
                            <span className='text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={instance.enable ? 'default' : 'secondary'}
                            className='text-xs'
                          >
                            {instance.enable ? '🟢 启用' : '⚫ 禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm'>
                            {instance.remark || (
                              <span className='text-muted-foreground'>
                                无备注
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className='text-muted-foreground text-sm'>
                            {instance.createTime}
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

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className='mt-6 flex items-center justify-between border-t pt-4'>
                  <div className='text-muted-foreground text-sm'>
                    显示第 <strong>{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                    <strong>{Math.min(currentPage * pageSize, total)}</strong>{' '}
                    条，共 <strong>{total}</strong> 条记录
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      ← 上一页
                    </Button>
                    <div className='flex items-center space-x-1'>
                      <span className='text-muted-foreground text-sm'>第</span>
                      <Badge variant='outline' className='px-2'>
                        {currentPage}
                      </Badge>
                      <span className='text-muted-foreground text-sm'>
                        页 / 共
                      </span>
                      <Badge variant='outline' className='px-2'>
                        {totalPages}
                      </Badge>
                      <span className='text-muted-foreground text-sm'>页</span>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
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
  );
}
