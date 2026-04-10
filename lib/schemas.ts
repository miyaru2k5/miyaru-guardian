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

export interface ScamReport {
  id: string;
  scammer_name: string;
  total_scam_amount: number;
  description: string;
  type: 'tôi bị scam' | 'đăng hộ';
  original_post_url?: string;
  reporter_contact_name: string;
  reporter_contact_zalo: string;
  status: 'pending' | 'approved' | 'rejected';
  slug: string;
  created_at: string;
  user_id?: string;
}

export interface ScamBank {
  id: string;
  report_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
}

export interface ScamMedia {
  id: string;
  report_id: string;
  url: string;
}

export interface ScamSocial {
  id: string;
  report_id: string;
  platform_name: string;
  platform_url?: string;
  username: string;
  user_url?: string;
}

export interface ScamWebsite {
  id: string;
  report_id: string;
  website_name?: string;
  url: string;
  domain?: string;
}
