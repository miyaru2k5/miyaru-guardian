import { getScamStats } from '@/app/actions/scam-search';

export default async function Stats() {
  const stats = await getScamStats();

  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>
        Hiện có <span className="font-bold text-white">{new Intl.NumberFormat().format(stats.scamAccounts)}</span> stk, sđt & <span className="font-bold text-white">{new Intl.NumberFormat().format(stats.scamFbs)}</span> fb lừa đảo, <span className="font-bold text-white">{new Intl.NumberFormat().format(stats.comments)}</span> bình luận, <span className="font-bold text-white">{stats.pending}</span> cảnh báo đang chờ duyệt
      </p>
      <p>Sẽ giúp bạn mua bán an toàn hơn khi online !!!</p>
    </div>
  );
}
