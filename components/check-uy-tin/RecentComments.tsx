import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecentComments() {
  return (
    <div className="text-center">
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
                <CardTitle>Bình Luận Mới Nhất</CardTitle>
                <Link href="/binh-luan" className="text-sm text-blue-500 hover:underline">
                    XEM THÊM BÌNH LUẬN
                </Link>
            </CardHeader>
        </Card>
    </div>
  );
}
