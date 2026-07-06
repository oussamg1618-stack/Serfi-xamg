const SUPABASE_URL = "https://yjxptnzzgvyofjdprmat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_EN-CBgOPYd79_QAoWMfymg_5owOvu1A";

const AI_ENDPOINT = "";
window.AI_ENDPOINT = AI_ENDPOINT;

window.supabaseClient = (SUPABASE_URL.startsWith("http"))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!window.supabaseClient) {
  console.warn("⚠️ AMG Serfix: لم يتم ربط قاعدة البيانات بعد.");
}
