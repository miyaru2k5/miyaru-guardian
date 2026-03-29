'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useImageUpload } from '@/hooks/useImageUpload';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

const formSchema = z.object({
  scammer_name: z.string().min(1, 'Tên người lừa đảo không được để trống'),
  total_scam_amount: z.coerce.number().min(0, 'Số tiền phải là một số dương'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  type: z.enum(['tôi bị scam', 'đăng hộ']),
  original_post_url: z.string().url('Link không hợp lệ').optional().or(z.literal('')),
  reporter_contact_name: z.string().min(1, 'Tên người liên hệ không được để trống'),
  reporter_contact_zalo: z.string().min(1, 'Zalo không được để trống'),
  bank_name: z.string().min(1, 'Tên ngân hàng không được để trống'),
  account_name: z.string().min(1, 'Tên chủ tài khoản không được để trống'),
  account_number: z.string().min(1, 'Số tài khoản không được để trống'),
  images: z.any()
});

export default function ReportScamPage() {
  const { uploadImages, isUploading } = useImageUpload();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'tôi bị scam'
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setSuccess(null);
    try {
      const imageUrls = values.images ? await uploadImages(Array.from(values.images)) : [];
      
      const supabase = createClient();

      const { data: reportData, error: reportError } = await supabase
        .from('scam_reports')
        .insert({
          scammer_name: values.scammer_name,
          total_scam_amount: values.total_scam_amount,
          description: values.description,
          type: values.type,
          original_post_url: values.original_post_url,
          reporter_contact_name: values.reporter_contact_name,
          reporter_contact_zalo: values.reporter_contact_zalo,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      const reportId = reportData.id;

      // This could be parallelized
      await supabase.from('scam_banks').insert({ report_id: reportId, bank_name: values.bank_name, account_name: values.account_name, account_number: values.account_number });
      if (imageUrls.length > 0) {
        await supabase.from('scam_media').insert(imageUrls.map(url => ({ report_id: reportId, url })));
      }

      setSuccess('Tố cáo của bạn đã được gửi thành công và đang chờ duyệt!');
      form.reset();
    } catch (err: any) {
      setError(`Lỗi: ${err.message}`);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-8">Tố cáo lừa đảo</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Add all form fields here based on schema */}
          <FormField
            control={form.control}
            name="scammer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Scammer</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ... other fields ... */}
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Bằng chứng (hình ảnh)</FormLabel>
                    <FormControl>
                        <Input type="file" multiple {...form.register('images')} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
          />

          <Button type="submit" disabled={isUploading}>
            {isUploading ? 'Đang xử lý...' : 'Gửi Tố Cáo'}
          </Button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}
        </form>
      </Form>
    </div>
  );
}
