// ============================================================
// AUTOVIZOR.CZ — Edge Function: notify-inquiry
//
// Posílá e-maily při novém vehicle_inquiries záznamu:
//  1. Prodejci notifikace o novém zájmu
//  2. Kupujícímu kopie potvrzení
//
// Spouštěno přes pgnet trigger (viz migrace 016) nebo manuálně:
//   POST https://<project>.supabase.co/functions/v1/notify-inquiry
//   { "inquiry_id": 123 }
//
// Setup:
//   1. supabase functions deploy notify-inquiry
//   2. supabase secrets set RESEND_API_KEY=re_xxx
//   3. supabase secrets set FROM_EMAIL=info@autovizor.cz
//   4. supabase secrets set SITE_URL=https://autovizor.cz
//   5. Aplikuj migraci 016 (pgnet trigger volá tuto funkci)
// ============================================================

// @ts-expect-error — Deno runtime in Supabase Edge
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.3';

interface InquiryRow {
  id: number;
  vehicle_id: number;
  dealer_id: number | null;
  buyer_user_id: string | null;
  buyer_name: string | null;
  buyer_email: string | null;
  buyer_phone: string | null;
  buyer_message: string;
  inquiry_type: string;
  offer_amount: number | null;
  created_at: string;
}

interface VehicleRow {
  id: number;
  title: string;
  price: number;
  slug: string | null;
  main_image_url: string | null;
  seller_email: string | null;
  seller_name: string | null;
}

interface DealerRow {
  id: number;
  name: string;
  email: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  message: 'Dotaz',
  phone_call: 'Žádost o zpětný telefonát',
  test_drive: 'Žádost o zkušební jízdu',
  offer: 'Cenová nabídka',
};

// @ts-expect-error — Deno global
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://autovizor.cz';
// @ts-expect-error — Deno global
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// @ts-expect-error — Deno global
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@autovizor.cz';
// @ts-expect-error — Deno global
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// @ts-expect-error — Deno global
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email to', to);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error('Resend API error:', res.status, await res.text());
  }
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('cs-CZ').format(n) + ' Kč';
}

function vehicleUrl(v: VehicleRow): string {
  const slug = v.slug || 'vozidlo';
  return `${SITE_URL}/vozidlo/${slug}-${v.id}`;
}

function sellerEmailHtml(inquiry: InquiryRow, vehicle: VehicleRow): string {
  const typeLabel = TYPE_LABELS[inquiry.inquiry_type] ?? 'Dotaz';
  const offerLine = inquiry.offer_amount
    ? `<p style="margin: 8px 0; padding: 12px; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
         <strong>Nabídka:</strong> ${formatPrice(inquiry.offer_amount)}
         <span style="color: #92400e;">(vyvolávací: ${formatPrice(vehicle.price)})</span>
       </p>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
    <h1 style="margin: 0 0 8px; color: #f97316; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Autovizor.cz</h1>
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Nový ${typeLabel.toLowerCase()}</h2>

    <p style="color: #4b5563; margin: 0 0 16px;">
      Máte nový dotaz na vůz <strong>${escapeHtml(vehicle.title)}</strong>
      (${formatPrice(vehicle.price)}).
    </p>

    ${offerLine}

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px;"><strong>${escapeHtml(inquiry.buyer_name ?? 'Anonymní zájemce')}</strong></p>
      ${inquiry.buyer_email ? `<p style="margin: 0; font-size: 13px;">📧 <a href="mailto:${inquiry.buyer_email}">${escapeHtml(inquiry.buyer_email)}</a></p>` : ''}
      ${inquiry.buyer_phone ? `<p style="margin: 0; font-size: 13px;">📞 <a href="tel:${inquiry.buyer_phone}">${escapeHtml(inquiry.buyer_phone)}</a></p>` : ''}
      <p style="margin: 12px 0 0; padding: 12px; background: white; border-radius: 6px; white-space: pre-wrap;">${escapeHtml(inquiry.buyer_message)}</p>
    </div>

    <a href="${vehicleUrl(vehicle)}" style="display: inline-block; padding: 12px 20px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Zobrazit vůz</a>

    <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
      Tento e-mail vám byl zaslán z Autovizor.cz. Odpovědět můžete přímo na e-mail nebo telefon zájemce.
    </p>
  </div>
</body></html>`;
}

function buyerEmailHtml(inquiry: InquiryRow, vehicle: VehicleRow): string {
  const typeLabel = TYPE_LABELS[inquiry.inquiry_type] ?? 'Dotaz';
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
    <h1 style="margin: 0 0 8px; color: #f97316; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Autovizor.cz</h1>
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Vaše ${typeLabel.toLowerCase()} byl odeslán</h2>

    <p style="color: #4b5563;">
      Děkujeme za projevený zájem o vůz <strong>${escapeHtml(vehicle.title)}</strong>.
      Prodejce vás brzy kontaktuje.
    </p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">Vaše zpráva:</p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(inquiry.buyer_message)}</p>
    </div>

    <a href="${vehicleUrl(vehicle)}" style="display: inline-block; padding: 12px 20px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Zobrazit vůz</a>

    <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
      Pokud jste tuto zprávu neodeslali, můžete ji ignorovat.
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[c];
  });
}

// @ts-expect-error — Deno serve
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    // pgnet posílá { type: 'INSERT', record: {...} }; manuální call: { inquiry_id }
    const inquiryId = payload.record?.id ?? payload.inquiry_id;
    if (!inquiryId) {
      return new Response('Missing inquiry_id', { status: 400 });
    }

    // Načti inquiry
    const { data: inquiry, error: inqErr } = await supabase
      .from('vehicle_inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    if (inqErr || !inquiry) {
      return new Response(`Inquiry not found: ${inqErr?.message}`, { status: 404 });
    }
    const i = inquiry as InquiryRow;

    // Skip spam
    if ((i as unknown as { is_spam?: boolean }).is_spam) {
      return new Response('Spam, skipped', { status: 200 });
    }

    // Načti vehicle
    const { data: vehicle, error: vehErr } = await supabase
      .from('vehicles')
      .select('id, title, price, slug, main_image_url, seller_email, seller_name')
      .eq('id', i.vehicle_id)
      .single();
    if (vehErr || !vehicle) {
      return new Response(`Vehicle not found: ${vehErr?.message}`, { status: 404 });
    }
    const v = vehicle as VehicleRow;

    // Najdi sellera
    let sellerEmail: string | null = v.seller_email;
    if (i.dealer_id) {
      const { data: dealer } = await supabase
        .from('dealers')
        .select('id, name, email')
        .eq('id', i.dealer_id)
        .maybeSingle();
      if (dealer) {
        const d = dealer as DealerRow;
        sellerEmail = d.email ?? sellerEmail;
      }
    }

    // Send to seller
    if (sellerEmail) {
      const subject = i.inquiry_type === 'offer'
        ? `🔥 Nabídka ${i.offer_amount ? new Intl.NumberFormat('cs-CZ').format(i.offer_amount) + ' Kč' : ''} — ${v.title}`
        : `Nový ${TYPE_LABELS[i.inquiry_type]?.toLowerCase() ?? 'dotaz'} — ${v.title}`;
      await sendEmail(sellerEmail, subject, sellerEmailHtml(i, v));
    }

    // Send copy to buyer
    if (i.buyer_email) {
      await sendEmail(i.buyer_email, `Potvrzení dotazu — ${v.title}`, buyerEmailHtml(i, v));
    }

    return new Response(JSON.stringify({ ok: true, inquiry_id: i.id, sent_to_seller: !!sellerEmail, sent_to_buyer: !!i.buyer_email }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-inquiry error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
