'use server';

import { createClient } from '@/utils/supabase/server';
import { scamReportSchema } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function submitReport(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized: You must be logged in to submit a report.' };
  }

  const rawFormData = Object.fromEntries(formData.entries());

  // Coerce number back from string
  const dataToValidate = {
    ...rawFormData,
    total_scam_amount: Number(rawFormData.total_scam_amount),
  };

  const validationResult = scamReportSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    return { success: false, error: 'Invalid form data.', details: validationResult.error.flatten() };
  }

  const { data: validatedData } = validationResult;
  const imageUrls = formData.getAll('imageUrls[]') as string[];

  try {
    const { data: reportId, error: rpcError } = await supabase.rpc('submit_scam_report', {
      p_scammer_name: validatedData.scammer_name,
      p_total_scam_amount: validatedData.total_scam_amount,
      p_description: validatedData.description,
      p_type: validatedData.type,
      p_original_post_url: validatedData.original_post_url || null,
      p_reporter_contact_name: validatedData.reporter_contact_name,
      p_reporter_contact_zalo: validatedData.reporter_contact_zalo,
      p_user_id: user.id,
      p_bank_name: validatedData.bank_name,
      p_account_name: validatedData.account_name,
      p_account_number: validatedData.account_number,
      p_image_urls: imageUrls,
      p_socials: [], // To be implemented in the form later
      p_websites: [], // To be implemented in the form later
    });

    if (rpcError) throw rpcError;

    // Revalidate paths if submission is successful
    revalidatePath('/check-uy-tin');

    return { success: true, message: 'Report submitted successfully.', reportId };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return { success: false, error: 'Đã có lỗi xảy ra trong quá trình gửi báo cáo. Vui lòng thử lại!' };
  }
}
