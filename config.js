// ============================================================
// إعدادات AMG Serfix — الملف الوحيد الذي تحتاج تعديله
// ============================================================
// 1. أنشئ حسابًا مجانيًا على https://supabase.com
// 2. أنشئ مشروعًا جديدًا (Project)
// 3. من Project Settings → API، انسخ:
//    - Project URL         → الصقه في SUPABASE_URL
//    - anon public key      → الصقه في SUPABASE_ANON_KEY
// 4. لا تضع أبدًا "service_role key" هنا — هذا سري وخطير جدًا
// ============================================================

const SUPABASE_URL = "https://yjxptnzzgvyofjdprmat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EN-CBgOPYd79_QAoWMfymg_5owOvu1A";

// اختياري ومتقدم: بعد نشر دالة ai-assistant-edge-function.ts (راجع دليل النشر)،
// الصق رابطها هنا لتفعيل ذكاء اصطناعي حقيقي متصل بالإنترنت بدل التصنيف المحلي فقط.
// مثال: "https://xxxxx.supabase.co/functions/v1/ai-assistant"
const AI_ENDPOINT = "";
window.AI_ENDPOINT = AI_ENDPOINT;

// لا تعدّل ما تحت هذا السطر
window.supabaseClient = (SUPABASE_URL.startsWith("http"))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!window.supabaseClient) {
  console.warn("⚠️ AMG Serfix: لم يتم ربط قاعدة البيانات بعد. النماذج تعمل بوضع تجريبي فقط. راجع config.js");
}
