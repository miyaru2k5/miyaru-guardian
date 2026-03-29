import MainLayout from '@/layouts/MainLayout';
import { ReactNode } from 'react';

export default function ScamerLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
