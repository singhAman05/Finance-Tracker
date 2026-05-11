interface FeedbackEmailData {
  name: string;
  email: string;
  message: string;
  rating?: number;
}

export const feedbackEmailTemplate = ({ name, email, message, rating }: FeedbackEmailData): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 20px; background: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; }
    .wrap { max-width: 640px; margin: 0 auto; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
    .hero { padding: 24px 28px; background: linear-gradient(135deg, #0f766e 0%, #0e7490 100%); color: #ffffff; }
    .eyebrow { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.9; }
    .title { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 24px 28px; }
    .meta { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .meta td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .meta td:first-child { color: #6b7280; width: 90px; }
    .meta td:last-child { color: #111827; font-weight: 600; }
    .message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
    .footer { border-top: 1px solid #eef2f7; background: #f9fafb; padding: 14px 28px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="hero">
        <p class="eyebrow">Finance Tracker Blog</p>
        <h1 class="title">New Feedback Received</h1>
      </div>
      <div class="body">
        <table class="meta">
          <tr><td>Name</td><td>${name}</td></tr>
          <tr><td>Email</td><td>${email}</td></tr>
          <tr><td>Rating</td><td>${rating ? `${rating}/5` : 'Not provided'}</td></tr>
        </table>
        <div class="message">${message}</div>
      </div>
      <div class="footer">Sent from the Engineering Blog feedback form.</div>
    </div>
  </div>
</body>
</html>
`;
