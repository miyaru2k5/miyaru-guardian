import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { randomUUID } from 'crypto';

const s3Config = {
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

export async function POST(req: Request) {
  try {
    if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const s3 = new S3Client(s3Config);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType } = await req.json();

    if (!contentType || !contentType.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid content type. Only images are allowed.' }, { status: 400 });
    }
    
    const extension = contentType.split('/')[1];
    const key = `scams/${randomUUID()}.${extension}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 600 }); // Expires in 10 minutes
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate pre-signed URL' }, { status: 500 });
  }
}
