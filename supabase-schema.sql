-- ============================================================
-- AMG Serfix — مخطط قاعدة البيانات لـ Supabase
-- انسخ هذا الملف كاملاً والصقه في: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- جدول مزودي الخدمة
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  full_name text not null,
  account_type text not null, -- فرد / شركة / مؤسسة عمومية
  wilaya text not null,
  field text not null,
  email text not null,
  status text default 'pending', -- pending / active / rejected
  created_at timestamptz default now()
);

-- جدول الحجوزات
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  service_type text not null,
  booking_date date not null,
  booking_time time not null,
  notes text,
  status text default 'received', -- received / reviewing / accepted / done
  created_at timestamptz default now()
);

-- جدول طلبات التوظيف
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  job_title text not null,
  applicant_name text not null,
  applicant_email text not null,
  cv_note text,
  status text default 'submitted',
  created_at timestamptz default now()
);

-- جدول رسائل الاتصال
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- تفعيل الحماية على مستوى الصفوف (Row Level Security)
-- بدون هذا، أي شخص يقدر يقرأ/يعدّل بيانات الجميع — خطوة أمان إلزامية
-- ============================================================
alter table providers enable row level security;
alter table bookings enable row level security;
alter table job_applications enable row level security;
alter table contact_messages enable row level security;

-- السماح لأي زائر (حتى غير مسجّل) بإضافة طلب جديد فقط (لا قراءة ولا تعديل)
create policy "anyone can insert providers" on providers for insert with check (true);
create policy "anyone can insert bookings" on bookings for insert with check (true);
create policy "anyone can insert job_applications" on job_applications for insert with check (true);
create policy "anyone can insert contact_messages" on contact_messages for insert with check (true);

-- السماح للمستخدم بقراءة بياناته الخاصة فقط (بعد تسجيل الدخول)
create policy "users read own bookings" on bookings for select using (auth.uid() = user_id);
create policy "users read own job_applications" on job_applications for select using (auth.uid() = user_id);
create policy "users read own providers" on providers for select using (auth.uid() = user_id);

-- ملاحظة: لوحة التحكم (admin.html) تحتاج مفتاح "service_role" الخاص (سري جدًا، لا يوضع
-- أبدًا في كود الواجهة الأمامية) لتقرأ كل الصفوف من كل المستخدمين — راجع دليل النشر.
