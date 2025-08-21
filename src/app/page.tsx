import { redirect } from 'next/navigation';

export default async function Page() {
  // 直接重定向到dashboard，不再需要登录检查
  redirect('/dashboard/overview');
}
