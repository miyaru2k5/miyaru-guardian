import MainLayout from '@/layouts/MainLayout';
import { ReactNode } from 'react';

export default function ToCaoScamLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
