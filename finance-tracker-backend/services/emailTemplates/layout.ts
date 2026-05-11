interface EmailLayoutOptions {
  title: string;
  accent: string;
  eyebrow?: string;
  body: string;
  footerNote?: string;
}

export const renderEmailLayout = ({ title, accent, eyebrow, body, footerNote }: EmailLayoutOptions): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 20px; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; }
    .shell { max-width: 560px; margin: 0 auto; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06); }
    .hero { padding: 24px 28px; background: ${accent}; color: #ffffff; }
    .eyebrow { margin: 0 0 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.9; }
    .title { margin: 0; font-size: 22px; line-height: 1.3; font-weight: 700; }
    .content { padding: 26px 28px; }
    .footer { border-top: 1px solid #eef2f7; padding: 16px 28px; font-size: 12px; color: #6b7280; background: #f9fafb; }
    .muted { color: #6b7280; }
    .metric { margin: 16px 0; font-size: 30px; font-weight: 800; color: #0f172a; }
    .pill { display: inline-block; border-radius: 999px; border: 1px solid #d1d5db; padding: 5px 10px; font-size: 12px; color: #374151; }
    .panel { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; background: #f9fafb; }
    .list { margin: 0; padding: 0; list-style: none; }
    .list li { margin: 8px 0; font-size: 14px; color: #374151; }
    .label { color: #6b7280; }
    .strong { color: #111827; font-weight: 600; }
  </style>
</head>
<body>
  <div class="shell">
    <div class="card">
      <div class="hero">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h1 class="title">${title}</h1>
      </div>
      <div class="content">${body}</div>
      <div class="footer">${footerNote || 'Finance Tracker automated notification'}</div>
    </div>
  </div>
</body>
</html>
`;
