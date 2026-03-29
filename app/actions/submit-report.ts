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
    // Insert into main report table
    const { data: reportData, error: reportError } = await supabase
      .from('scam_reports')
      .insert({
        scammer_name: validatedData.scammer_name,
        total_scam_amount: validatedData.total_scam_amount,
        description: validatedData.description,
        type: validatedData.type,
        original_post_url: validatedData.original_post_url,
        reporter_contact_name: validatedData.reporter_contact_name,
        reporter_contact_zalo: validatedData.reporter_contact_zalo,
        user_id: user.id
      })
      .select()
      .single();

    if (reportError) throw reportError;
    const reportId = reportData.id;

    // Parallel inserts for related data
    const promises = [];

    // Bank info
    promises.push(
      supabase.from('scam_banks').insert({
        report_id: reportId,
        bank_name: validatedData.bank_name,
        account_name: validatedData.account_name,
        account_number: validatedData.account_number,
      })
    );

    // Media URLs
    if (imageUrls.length > 0) {
      promises.push(
        supabase.from('scam_media').insert(imageUrls.map(url => ({ report_id: reportId, url })))
      );
    }
    
    const results = await Promise.all(promises);
    results.forEach(result => {
        if (result.error) throw result.error;
    });

    // Revalidate paths if submission is successful
    revalidatePath('/check-uy-tin');

    return { success: true, message: 'Report submitted successfully.' };
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return { success: false, error: `Database error: ${error.message}` };
  }
}
