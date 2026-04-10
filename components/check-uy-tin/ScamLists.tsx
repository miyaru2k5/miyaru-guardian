import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScamLists() {
  return (
    <div className="space-y-4 text-center">
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
                <CardTitle>31/3/2026 CÓ 0 CẢNH BÁO</CardTitle>
                <Link href="/bai-viet" className="text-sm text-blue-500 hover:underline">
                    XEM THÊM BÀI CẢNH BÁO HÔM NAY
                </Link>
            </CardHeader>
        </Card>
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
                <CardTitle>LỪA ĐẢO PHỔ BIỂN 7 NGÀY GẦN ĐÂY</CardTitle>
                 <Link href="/trending-scams" className="text-sm text-blue-500 hover:underline">
                    XEM CHI TIẾT
                </Link>
            </CardHeader>
        </Card>
        <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
                <CardTitle>TOP 3 TÌM KIẾM NGÀY</CardTitle>
                 <Link href="/top-searched" className="text-sm text-blue-500 hover:underline">
                    XEM CHI TIẾT
                </Link>
            </CardHeader>
        </Card>
    </div>
  );
}
