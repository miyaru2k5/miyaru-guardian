import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const revalidate = 60;

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

  const scamBanks = report.scam_banks || [];
  const scamSocials = report.scam_socials || [];
  const scamMedia = report.scam_media || [];
  const scamWebsites = report.scam_websites || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{report.scammer_name}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant={report.type === 'tôi bị scam' ? 'destructive' : 'default'}>
                  {report.type === 'tôi bị scam' ? 'Nạn nhân' : 'Phát hiện'}
                </Badge>
                <Badge variant="outline">
                  Ngày đăng: {formatDate(report.created_at)}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tổng số tiền lừa đảo</p>
              <p className="text-3xl font-bold text-destructive">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(report.total_scam_amount)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Chi tiết vụ việc</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{report.description}</p>
              {report.original_post_url && (
                <a 
                  href={report.original_post_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                >
                  Xem bài viết gốc →
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {scamBanks.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin ngân hàng</h2>
              <div className="space-y-3">
                {scamBanks.map(bank => (
                  <div key={bank.id} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium">{bank.bank_name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">TK:</span> {bank.account_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">CTK:</span> {bank.account_name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {scamSocials.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Mạng xã hội</h2>
              <div className="space-y-3">
                {scamSocials.map(social => (
                  <div key={social.id} className="p-3 bg-secondary rounded-lg">
                    <p className="font-medium">{social.platform_name}</p>
                    <p className="text-sm text-muted-foreground">@{social.username}</p>
                    <a 
                      href={social.user_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Xem profile →
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {scamWebsites.length > 0 && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Website lừa đảo</h2>
            <div className="space-y-2">
              {scamWebsites.map(site => (
                <a 
                  key={site.id}
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block p-3 bg-secondary rounded-lg hover:bg-secondary/80"
                >
                  {site.url}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {scamMedia.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Bằng chứng ({scamMedia.length} hình)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {scamMedia.map(media => (
                <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  <Image 
                    src={media.url} 
                    alt="Bằng chứng lừa đảo" 
                    fill
                    className="object-cover hover:scale-105 transition-transform cursor-pointer"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Banner placeholder */}
      <div className="my-8 p-8 bg-secondary rounded-lg text-center">
        <p className="font-semibold text-muted-foreground">BANNER QUẢNG CÁO</p>
      </div>
    </div>
  );
}

