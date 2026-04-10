-- Create Function for Atomic Scam Report Submission
CREATE OR REPLACE FUNCTION public.submit_scam_report(
    p_scammer_name TEXT,
    p_total_scam_amount DECIMAL,
    p_description TEXT,
    p_type TEXT,
    p_original_post_url TEXT,
    p_reporter_contact_name TEXT,
    p_reporter_contact_zalo TEXT,
    p_user_id UUID,
    p_bank_name TEXT,
    p_account_name TEXT,
    p_account_number TEXT,
    p_image_urls TEXT[],
    p_socials JSONB DEFAULT '[]'::jsonb,
    p_websites JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_report_id UUID;
    v_image_url TEXT;
    v_slug TEXT;
    v_social RECORD;
    v_website RECORD;
BEGIN
    -- Generate Slug (basic version)
    v_slug := lower(regexp_replace(p_scammer_name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Trim trailing/leading dashes
    v_slug := trim(both '-' from v_slug);
    -- Append random part from UUID to ensure uniqueness
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);

    -- Insert into scam_reports
    INSERT INTO public.scam_reports (
        scammer_name,
        total_scam_amount,
        description,
        type,
        original_post_url,
        reporter_contact_name,
        reporter_contact_zalo,
        user_id,
        status,
        slug
    ) VALUES (
        p_scammer_name,
        p_total_scam_amount,
        p_description,
        p_type::scam_report_type,
        p_original_post_url,
        p_reporter_contact_name,
        p_reporter_contact_zalo,
        p_user_id,
        'pending',
        v_slug
    ) RETURNING id INTO v_report_id;

    -- Insert into scam_banks
    INSERT INTO public.scam_banks (
        report_id,
        bank_name,
        account_name,
        account_number
    ) VALUES (
        v_report_id,
        p_bank_name,
        p_account_name,
        p_account_number
    );

    -- Insert into scam_media
    IF p_image_urls IS NOT NULL THEN
        FOREACH v_image_url IN ARRAY p_image_urls
        LOOP
            INSERT INTO public.scam_media (report_id, url)
            VALUES (v_report_id, v_image_url);
        END LOOP;
    END IF;

    -- Insert into scam_socials
    IF p_socials IS NOT NULL AND jsonb_array_length(p_socials) > 0 THEN
        FOR v_social IN SELECT * FROM jsonb_to_recordset(p_socials) AS x(platform_name TEXT, platform_url TEXT, username TEXT, user_url TEXT)
        LOOP
            INSERT INTO public.scam_socials (report_id, platform_name, platform_url, username, user_url)
            VALUES (v_report_id, v_social.platform_name, v_social.platform_url, v_social.username, v_social.user_url);
        END LOOP;
    END IF;

    -- Insert into scam_websites
    IF p_websites IS NOT NULL AND jsonb_array_length(p_websites) > 0 THEN
        FOR v_website IN SELECT * FROM jsonb_to_recordset(p_websites) AS x(website_name TEXT, url TEXT, domain TEXT)
        LOOP
            INSERT INTO public.scam_websites (report_id, website_name, url, domain)
            VALUES (v_report_id, v_website.website_name, v_website.url, v_website.domain);
        END LOOP;
    END IF;

    RETURN v_report_id;
END;
$$;

-- Create Function for Efficient Scam Stats
CREATE OR REPLACE FUNCTION public.get_scam_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'scam_accounts', (SELECT count(*) FROM public.scam_reports WHERE type IN ('tôi bị scam', 'đăng hộ', 'stk', 'sdt')),
        'scam_fbs', (SELECT count(*) FROM public.scam_reports WHERE type IN ('đăng hộ', 'fb')),
        'comments', (SELECT count(*) FROM public.comments),
        'pending', (SELECT count(*) FROM public.scam_reports WHERE status = 'pending')
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$;
