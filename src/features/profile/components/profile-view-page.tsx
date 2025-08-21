import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col p-4'>
      <Card>
        <CardHeader>
          <CardTitle>用户配置</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground'>用户配置功能将在此处实现。</p>
        </CardContent>
      </Card>
    </div>
  );
}
