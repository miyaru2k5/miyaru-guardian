import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldAlert, ShoppingCart, ShieldCheck, Bot } from 'lucide-react';

export default function ActionButtons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 my-4">
      <Button asChild variant="destructive" className="flex-1 md:flex-initial">
        <Link href="/to-cao-scam">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Tố Cáo Scam
        </Link>
      </Button>
      <Button asChild variant="secondary" className="flex-1 md:flex-initial">
        <Link href="/cho-buon-ban">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Chợ Buôn Bán
        </Link>
      </Button>
      <Button asChild variant="secondary" className="flex-1 md:flex-initial">
        <Link href="/bao-hiem-cs">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Bảo Hiểm CS
        </Link>
      </Button>
      <Button asChild variant="secondary" className="flex-1 md:flex-initial">
        <Link href="/bot-check">
          <Bot className="w-4 h-4 mr-2" />
          Bot Check
        </Link>
      </Button>
    </div>
  );
}
