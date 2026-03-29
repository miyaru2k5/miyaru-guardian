'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useState, useTransition, useEffect, useMemo, useCallback } from 'react';
import { scamReportSchema, ScamReportFormValues } from '@/lib/schemas';
import { submitReport } from '@/app/actions/submit-report';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

const VIETNAMESE_BANKS = [
  'Vietcombank (VCB)',
  'BIDV',
  'Agribank',
  'Techcombank',
  'MB Bank (MBBank)',
  'VPBank',
  'Sacombank',
  'ACB',
  'TPBank',
  'Vietinbank',
  'OCB',
  'SHB',
  'SeABank',
  'Eximbank',
  'Bac A Bank',
  'Nam A Bank',
  'NCB',
  'Shinhan Bank',
  'Standard Chartered',
  'Citibank',
];

export default function ReportScamPage() {
  const { uploadImages, isUploading } = useImageUpload();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScamReportFormValues>({
    resolver: zodResolver(scamReportSchema),
    defaultValues: {
      type: 'tôi bị scam',
      scammer_name: '',
      total_scam_amount: 0,
      description: '',
      original_post_url: '',
      reporter_contact_name: '',
      reporter_contact_zalo: '',
      bank_name: '',
      account_name: '',
      account_number: '',
    }
  });

  async function onSubmit(values: ScamReportFormValues) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const imageUrls = values.images ? await uploadImages(Array.from(values.images)) : [];
        
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'images') {
            formData.append(key, String(value));
          }
        });
        imageUrls.forEach(url => formData.append('imageUrls[]', url));

        const result = await submitReport(formData);

        if (!result.success) {
          throw new Error(result.error || 'An unknown error occurred.');
        }

        setSuccess('Tố cáo của bạn đã được gửi thành công và đang chờ duyệt!');
        form.reset();

      } catch (err: any) {
        setError(`Lỗi: ${err.message}`);
      }
    });
  }

  const isLoading = isUploading || isPending;

  const formFields = ['scammer_name', 'type', 'total_scam_amount', 'description', 'original_post_url', 'bank_name', 'account_number', 'account_name', 'reporter_contact_name', 'reporter_contact_zalo'];
  const completedFields = formFields.filter(f => {
    const value = form.getValues(f as keyof ScamReportFormValues);
    return value && (typeof value === 'string' ? value.trim() !== '' : value > 0);
  });
  const progress = Math.round((completedFields.length / formFields.length) * 100);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && !isLoading) {
        form.handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, isLoading]);

  useEffect(() => {
    if (imageFiles.length > 0) {
      form.setValue('images', imageFiles as any);
    }
  }, [imageFiles, form]);

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Tố cáo lừa đảo</h1>
        <p className="text-muted-foreground">Giúp cộng đồng an toàn hơn bằng cách chia sẻ thông tin về kẻ lừa đảo</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Tiến trình</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Thông tin người lừa đảo */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người lừa đảo</CardTitle>
              <CardDescription>Cung cấp thông tin về kẻ lừa đảo mà bạn biết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="scammer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên người lừa đảo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại báo cáo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại báo cáo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tôi bị scam">Tôi bị lừa đảo</SelectItem>
                        <SelectItem value="đăng hộ">Phát hiện lừa đảo (đăng hộ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_scam_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền lừa đảo (VND) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1000000" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết vụ việc..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_post_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link bài viết gốc (nếu có)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Thông tin ngân hàng */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin ngân hàng</CardTitle>
              <CardDescription>Thông tin tài khoản ngân hàng của kẻ lừa đảo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên ngân hàng *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Vietcombank" {...field} list="bank-list" />
                          <datalist id="bank-list">
                            {VIETNAMESE_BANKS.map(bank => (
                              <option key={bank} value={bank} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tài khoản *</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên chủ tài khoản *</FormLabel>
                    <FormControl>
                      <Input placeholder="NGUYEN VAN A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bằng chứng */}
          <Card>
            <CardHeader>
              <CardTitle>Bằng chứng</CardTitle>
              <CardDescription>Tải lên hình ảnh, tin nhắn, giao dịch...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="text-primary font-medium">Click để tải ảnh</span> hoặc kéo thả
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF tối đa 10MB</p>
                  </label>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Thông tin liên hệ người báo cáo */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ của bạn</CardTitle>
              <CardDescription>Chúng tôi sẽ bảo mật thông tin này</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reporter_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ tên *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reporter_contact_zalo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số Zalo *</FormLabel>
                      <FormControl>
                        <Input placeholder="0912345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Button type="submit" size="lg" disabled={isLoading} className="w-full">
              {isUploading ? 'Đang tải ảnh lên...' : isPending ? 'Đang gửi...' : 'Gửi Tố Cáo (Ctrl+Enter)'}
            </Button>
            {error && (
              <div className="p-4 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 text-sm text-green-800 bg-green-50 rounded-lg border border-green-200">
                {success}
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
