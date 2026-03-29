'use client';

import { useState, useTransition, useEffect } from 'react';
import { searchScams } from '@/app/actions/scam-search';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SearchResult = {
  report_id: string;
  scammer_name: string;
  total_scam_amount: number;
  type: string;
  created_at: string;
  description: string;
}

export default function CheckUyTinPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    startTransition(async () => {
      if (debouncedQuery.trim() === '') {
        setResults([]);
        return;
      }
      const searchResults = await searchScams(debouncedQuery);
      setResults(searchResults);
    });
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Kiểm Tra & Tố Cáo Scam</h1>
        <p className="text-muted-foreground">Tìm kiếm thông tin lừa đảo theo số tài khoản, tên, số điện thoại...</p>
      </div>

      <div className="mb-8">
        <Input 
          type="text" 
          placeholder="Nhập thông tin cần tìm..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-lg"
        />
      </div>
      
      {/* Banner placeholder */}
      <div className="my-6 p-4 bg-secondary rounded-lg text-center">
          <p className="font-semibold text-muted-foreground">BANNER QUẢNG CÁO</p>
      </div>

      <div className="space-y-4">
        {isPending ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              Đang tìm kiếm...
            </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tìm thấy {results.length} kết quả</p>
            {results.map(result => (
              <Link key={result.report_id} href={`/scamer/${result.report_id}`} className="block">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{result.scammer_name}</h3>
                          <Badge variant={result.type === 'tôi bị scam' ? 'destructive' : 'default'}>
                            {result.type === 'tôi bị scam' ? 'Nạn nhân' : 'Phát hiện'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-muted-foreground">Số tiền</p>
                        <p className="font-bold text-destructive">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(result.total_scam_amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          query.trim() !== '' && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-2">Không tìm thấy kết quả nào</p>
              <p className="text-sm text-muted-foreground">Hãy thử tìm kiếm với từ khóa khác hoặc báo cáo nếu bạn biết thông tin về kẻ lừa đảo</p>
              <Link href="/to-cao-scam" className="text-blue-500 hover:underline text-sm mt-2 inline-block">
                → Báo cáo ngay
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
