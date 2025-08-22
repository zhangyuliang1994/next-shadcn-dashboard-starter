'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export interface SimulatorInstance {
  id?: number;
  httpPort: number;
  httpIp: string;
  enable: boolean;
  remark: string | null;
  createTime?: string;
  updateTime?: string | null;
}

interface InstanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (instance: SimulatorInstance) => void;
  initialData?: SimulatorInstance;
  isLoading?: boolean;
}

export default function InstanceForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false
}: InstanceFormProps) {
  const [formData, setFormData] = useState<SimulatorInstance>({
    httpPort: 80,
    httpIp: '',
    enable: true,
    remark: null
  });

  const isEdit = Boolean(initialData?.id);

  // 当对话框打开或初始数据变化时，更新表单数据
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          httpPort: 80,
          httpIp: '',
          enable: true,
          remark: null
        });
      }
    } else {
      // 对话框关闭时重置表单数据，确保下次打开时是干净的状态
      setFormData({
        httpPort: 80,
        httpIp: '',
        enable: true,
        remark: null
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        httpPort: 80,
        httpIp: '',
        enable: true,
        remark: null
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑实例' : '添加新实例'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改实例的配置信息' : '填写新实例的配置信息'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            {/* HTTP IP地址 */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='httpIp' className='text-right'>
                IP地址
              </Label>
              <Input
                id='httpIp'
                placeholder='例如: 192.168.1.100'
                className='col-span-3'
                value={formData.httpIp}
                onChange={(e) =>
                  setFormData({ ...formData, httpIp: e.target.value })
                }
                required
              />
            </div>

            {/* HTTP端口 */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='httpPort' className='text-right'>
                端口
              </Label>
              <Input
                id='httpPort'
                type='number'
                placeholder='80'
                className='col-span-3'
                value={formData.httpPort}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    httpPort: parseInt(e.target.value) || 80
                  })
                }
                required
                min={1}
                max={65535}
              />
            </div>

            {/* 启用状态 */}
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='enable' className='text-right'>
                启用状态
              </Label>
              <div className='col-span-3 flex items-center space-x-2'>
                <Switch
                  id='enable'
                  checked={formData.enable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enable: checked })
                  }
                />
                <span className='text-muted-foreground text-sm'>
                  {formData.enable ? '启用' : '禁用'}
                </span>
              </div>
            </div>

            {/* 备注 */}
            <div className='grid grid-cols-4 items-start gap-4'>
              <Label htmlFor='remark' className='pt-2 text-right'>
                备注
              </Label>
              <Textarea
                id='remark'
                placeholder='输入备注信息（可选）'
                className='col-span-3'
                rows={3}
                value={formData.remark || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    remark: e.target.value || null
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleReset}
              disabled={isLoading}
            >
              重置
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                  {isEdit ? '保存中...' : '添加中...'}
                </>
              ) : (
                <>{isEdit ? '保存修改' : '添加实例'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
