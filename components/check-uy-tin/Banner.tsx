import { getBanners } from '@/app/actions/scam-search';
import Image from 'next/image';
import Link from 'next/link';

type BannerProps = {
  position: number;
};

export default async function Banner({ position }: BannerProps) {
  const banners = await getBanners();
  const banner = banners.find(b => b.position === position);

  if (!banner) {
    return null;
  }

  return (
    <div className="my-6">
      <Link href={banner.link || '#'} target="_blank" rel="noopener noreferrer">
        <Image
          src={banner.image_url}
          alt={banner.title || 'Banner'}
          width={800}
          height={200}
          className="rounded-lg w-full h-auto"
        />
        {banner.title && (
            <p className="text-center text-sm text-muted-foreground mt-2">{banner.title}</p>
        )}
      </Link>
    </div>
  );
}
