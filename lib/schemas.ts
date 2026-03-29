import * as z from 'zod';

export const scamReportSchema = z.object({
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
  // The 'images' field is handled separately on the client for upload
  // and the URLs are passed to the server action.
  images: z.any().optional(), 
});

export type ScamReportFormValues = z.infer<typeof scamReportSchema>;
