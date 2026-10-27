import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSession } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file     = formData.get('file');

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max file size is 5MB' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder:           'cafein-menu',
        transformation:   [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
      },
      (err, res) => err ? reject(err) : resolve(res)
    ).end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
