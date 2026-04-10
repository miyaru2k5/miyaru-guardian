import Stats from '@/components/check-uy-tin/Stats';
import Search from '@/components/check-uy-tin/Search';
import ActionButtons from '@/components/check-uy-tin/ActionButtons';
import Banner from '@/components/check-uy-tin/Banner';
import ScamLists from '@/components/check-uy-tin/ScamLists';
import RecentComments from '@/components/check-uy-tin/RecentComments';

export default function CheckUyTinPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Kiểm Tra & Tố Cáo Scam</h1>
        <Stats />
      </div>

      <div className="mb-8">
        <Search />
      </div>
      
      <ActionButtons />

      <Banner position={1} />
      
      <div className="my-8">
        <ScamLists />
      </div>

      <Banner position={2} />
      
      <div className="my-8">
        <RecentComments />
      </div>

      <Banner position={3} />

    </div>
  );
}
