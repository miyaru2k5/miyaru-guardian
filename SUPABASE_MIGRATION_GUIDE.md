# Supabase Migration Guide - Lovable Cloud → Your Own Instance

## ✅ Configuration Updated

The following configuration files have been updated to point to your Supabase instance:

**Project Details:**
- **Project ID:** xmipgkditkdqrxkmpvwz
- **Project URL:** https://xmipgkditkdqrxkmpvwz.supabase.co
- **Publishable Key:** sb_publishable_VHBv-CS-M9hnn2w1tFcMqA_NtWsC3ns

**Files Updated:**
1. `.env` - Environment variables with new Supabase credentials
2. `supabase/config.toml` - Project ID updated

## 🔧 Next Steps: Apply Database Migrations

Your new Supabase instance needs to have all the database schema and functions set up. Follow these steps:

### Method 1: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **xmipgkditkdqrxkmpvwz**
3. Navigate to **SQL Editor**
4. Run each migration file in order:

#### Migration Order:
1. **20260223125335_e97cd555-71ef-49d8-a2d0-c09881608d9c.sql**
   - Creates: profiles, user_roles, traders, transactions, bank_accounts, insurance_fund tables
   - Creates: RLS policies and helper functions

2. **20260226151139_ee67c7d0-7afb-49aa-aaa8-25f39f2d6c5e.sql**
   - Additional schema updates

3. **20260228120335_3e989989-7756-451f-a672-0b1e33790abb.sql**
   - Additional schema updates

4. **20260228123000_add_facebook_contacts_and_terms.sql**
   - Creates: facebook_contacts, terms_pages tables
   - Sets up admin-only policies

5. **20260228200000_add_site_analytics.sql**
   - Creates: site_analytics table
   - Adds page view tracking function

6. **20260301000000_first_user_admin_and_admin_manage_users.sql**
   - Sets up first user as admin
   - Admin user management policies

7. **20260301100000_system_settings_auth_google.sql**
   - Google authentication settings

8. **20260302141645_e6cc8879-0f34-43a6-9662-4ff85b489980.sql**
   - Final schema adjustments

### Method 2: Using Supabase CLI

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref xmipgkditkdqrxkmpvwz

# Push all migrations
supabase db push
```

## 📋 Database Schema Overview

After running all migrations, your instance will have:

### Tables:
- **auth.users** - Managed by Supabase Auth
- **profiles** - User profile information
- **user_roles** - User role assignments (admin/user)
- **traders** - GDV trader data
- **transactions** - GDTG transaction records
- **bank_accounts** - Bank account information for payments
- **insurance_fund** - Insurance fund tracking
- **facebook_contacts** - Facebook contact information
- **terms_pages** - Terms & conditions pages
- **site_analytics** - Page view analytics

### Functions:
- `has_role()` - Check user role
- `is_admin()` - Check if user is admin
- `update_updated_at_column()` - Auto-update timestamps
- `handle_new_user()` - Auto-create profile on signup
- `increment_page_views()` - Track page views

## 🧪 Testing the Migration

After applying all migrations:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Test authentication:**
   - Go to http://localhost:5173/register
   - Create a test account
   - Verify that user profile is created automatically

4. **Test admin functions:**
   - Go to http://localhost:5173/admin
   - You should see admin interface (if you're logged in as admin)

## ⚠️ Important Notes

1. **Service Role Key**: For write operations in the backend, you may need the Service Role Key from your Supabase project dashboard (Settings > API)

2. **Environment Variables**: If you need the Service Role Key, add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Database Backups**: Before running migrations on production, backup your database

4. **RLS Policies**: All Row Level Security policies have been configured to ensure:
   - Users can only see/modify their own data
   - Admins have full access to all data
   - Public data is visible to everyone

5. **Email Configuration**: Make sure to configure email templates in Supabase Dashboard > Auth > Email Templates

## 🔗 Useful Links

- Supabase Dashboard: https://supabase.com/dashboard/projects
- Your Project: https://supabase.com/dashboard/project/xmipgkditkdqrxkmpvwz
- Supabase CLI Docs: https://supabase.com/docs/guides/cli

## 📝 Migration File Locations

All SQL migration files are located in: `supabase/migrations/`

Additional SQL files for manual execution:
- `supabase/run_facebook_terms_migration.sql`
- `supabase/run_site_analytics_migration.sql`

## ✨ Stability Features

Your application includes:

1. **Authentication**: Email/password auth with JWT tokens
2. **Role-Based Access Control**: Admin and User roles
3. **Row Level Security**: Data isolation by user
4. **Auto-scaling**: Supabase handles database scaling
5. **Real-time Updates**: WebSocket support for live data
6. **Automatic Backups**: Daily backups (Supabase default)

---

**Questions?** Check the migration SQL files in `supabase/migrations/` for detailed implementation details.
