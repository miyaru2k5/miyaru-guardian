'use client';

import { useState, useTransition } from 'react';
import { searchScams } from '@/app/actions/scam-search';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type SearchResult = {
  report_id: string;
  scammer_name: string;
  search_vector: string;
}

export default function CheckUyTinPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(async () => {
      if (query.trim() === '') {
        setResults([]);
        return;
      }
      const searchResults = await searchScams(query);
      setResults(searchResults);
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Kiểm Tra & Tố Cáo Scam</h1>
        <p className="text-muted-foreground mt-2">Tìm kiếm thông tin lừa đảo theo số tài khoản, tên, domain, etc.</p>
      </div>

      <div className="flex w-full items-center space-x-2">
        <Input 
          type="text" 
          placeholder="Nhập số tài khoản, tên, domain..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isPending}>
          {isPending ? 'Đang tìm...' : 'Tìm Kiếm'}
        </Button>
      </div>
      
      {/* Placeholder for Banners */}
      <div className="my-8 p-4 bg-secondary rounded-lg text-center">
          <p className="font-semibold">BANNER QUẢNG CÁO</p>
      </div>

      <div className="mt-8 space-y-4">
        {results.length > 0 ? (
          results.map(result => (
            <div key={result.report_id} className="p-4 border rounded-lg">
              <Link href={`/scamer/${result.report_id}`}>
                <h3 className="font-bold text-lg hover:underline">{result.scammer_name}</h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">{result.search_vector}</p>
            </div>
          ))
        ) : (
          !isPending && <p className="text-center text-muted-foreground">Chưa có kết quả tìm kiếm.</p>
        )}
      </div>
    </div>
  );
}
