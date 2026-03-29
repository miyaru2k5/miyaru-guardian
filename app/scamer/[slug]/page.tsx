import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

type ScammerDetailsPageProps = {
  params: { slug: string };
};

export default async function ScammerDetailsPage({ params }: ScammerDetailsPageProps) {
  const supabase = await createClient();
  
  const { data: report } = await supabase
    .from('scam_reports')
    .select(`
      *,
      scam_banks(*),
      scam_media(*),
      scam_socials(*),
      scam_websites(*)
    `)
    .eq('slug', params.slug)
    .eq('status', 'approved')
    .single();

  if (!report) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="bg-card p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{report.scammer_name}</h1>
        <p className="text-lg text-destructive mb-6">Tổng số tiền lừa đảo: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.total_scam_amount)}</p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">Chi tiết vụ việc</h2>
            <p className="whitespace-pre-wrap">{report.description}</p>
          </div>

          {report.scam_banks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">Thông tin ngân hàng</h2>
              <ul className="space-y-2">
                {report.scam_banks.map(bank => (
                  <li key={bank.id} className="p-3 bg-secondary rounded-md">
                    <p><strong>Ngân hàng:</strong> {bank.bank_name}</p>
                    <p><strong>Chủ tài khoản:</strong> {bank.account_name}</p>
                    <p><strong>Số tài khoản:</strong> {bank.account_number}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.scam_socials.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">Tài khoản mạng xã hội lừa đảo</h2>
              <ul className="space-y-2">
                {report.scam_socials.map(social => (
                  <li key={social.id} className="p-3 bg-secondary rounded-md">
                     <p><strong>Nền tảng:</strong> {social.platform_name}</p>
                     <p><strong>Tên người dùng:</strong> {social.username}</p>
                     <a href={social.user_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link tới trang cá nhân</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.scam_media.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold border-b pb-2 mb-4">Bằng chứng</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.scam_media.map(media => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={media.id} src={media.url} alt="Bằng chứng lừa đảo" className="rounded-lg w-full h-auto object-cover" />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

       {/* Placeholder for Banners */}
       <div className="my-8 p-4 bg-secondary rounded-lg text-center">
          <p className="font-semibold">BANNER QUẢNG CÁO</p>
      </div>
    </div>
  );
}
