import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // 直接重定向到overview页面，不再需要登录检查
  redirect('/dashboard/overview');
}
