// ============================================================
// AMG Serfix — دالة وسيطة آمنة لمساعد ذكاء اصطناعي متعدد المزودين
// ============================================================
// لماذا نحتاج هذه الدالة ولا نضع المفتاح مباشرة بالموقع؟
// لأن أي مفتاح API يوضع في كود الواجهة الأمامية (JS يعمل بمتصفح الزائر)
// يصبح مرئيًا لأي شخص يفتح "أدوات المطوّر" في متصفحه، فيستطيع سرقته.
// هذه الدالة تعمل على خادم Supabase، والمفتاح يبقى مخفيًا هناك فقط.
//
// بنية "متعددة المزودين": غيّر متغيّر AI_PROVIDER فقط للتبديل بين
// Claude (Anthropic) أو GPT (OpenAI) أو Gemini (Google) بدون تغيير باقي الكود.
//
// خطوات التفعيل:
// 1. ثبّت Supabase CLI: npm install -g supabase
// 2. من مجلد مشروعك: supabase functions new ai-assistant
// 3. الصق هذا الكود في الملف الناتج (index.ts)
// 4. اختر مزودًا واحدًا على الأقل وأضف مفتاحه كسر (Secret):
//    supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
//    supabase secrets set OPENAI_API_KEY=sk-xxxxx
//    supabase secrets set GEMINI_API_KEY=xxxxx
//    supabase secrets set AI_PROVIDER=claude   (أو: openai / gemini)
// 5. انشر الدالة: supabase functions deploy ai-assistant
// 6. الصق الرابط الناتج في AI_ENDPOINT داخل config.js
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // يُفضَّل تحديده لدومينك فقط بعد النشر: https://www.serfixamg.dz
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = "أنت مساعد ذكي لمنصة خدمات جزائرية اسمها AMG Serfix. مهمتك: توجيه المستخدم بإيجاز (3-4 أسطر كحد أقصى) نحو فئة الخدمة المناسبة (منزلية، إدارية، شركات، مهن حرة) أو نحو الجهة الحكومية الرسمية الصحيحة إذا كان سؤاله إداريًا. أجب بالعربية الجزائرية البسيطة.";

async function callClaude(message: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY غير مُعدّ");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text ?? "عذرًا، لم أفهم طلبك.";
}

async function callOpenAI(message: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY غير مُعدّ");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "عذرًا، لم أفهم طلبك.";
}

async function callGemini(message: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY غير مُعدّ");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nسؤال المستخدم: ${message}` }] }],
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "عذرًا، لم أفهم طلبك.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.length > 1000) {
      return new Response(JSON.stringify({ error: "رسالة غير صالحة" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provider = (Deno.env.get("AI_PROVIDER") || "claude").toLowerCase();
    let reply: string;

    if (provider === "openai") reply = await callOpenAI(message);
    else if (provider === "gemini") reply = await callGemini(message);
    else reply = await callClaude(message);

    return new Response(JSON.stringify({ reply, provider }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

