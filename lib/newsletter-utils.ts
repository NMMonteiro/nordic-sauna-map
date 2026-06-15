
export function generateEmailHtml(
  templateId: string, 
  subject: string, 
  content: string, 
  imageUrl: string | null, 
  lang: string, 
  unsubscribeUrl: string = "#",
  siteUrl: string = "https://nordicsaunamap.com"
) {
  const unsubscribeText = { en: "Unsubscribe", sv: "Avregistrera dig", fi: "Peruuta tilaus" }[lang as 'en' | 'sv' | 'fi'] || "Unsubscribe";
  const viewText = { en: "Visit the Platform", sv: "Besök plattformen", fi: "Vieraile alustalla" }[lang as 'en' | 'sv' | 'fi'] || "Visit the Platform";

  const fallbackImage = "https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80&w=1200";
  const finalImageUrl = imageUrl || fallbackImage;

  // Template-specific configurations
  let styles = "";
  let structure = "";

  switch (templateId) {
    case "magazine":
      styles = `
        body { font-family: 'Inter', -apple-system, sans-serif; background: #000000; margin: 0; padding: 0; color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; background: #000000; }
        .hero { position: relative; width: 100%; height: 400px; background: url('${finalImageUrl}') center/cover; }
        .overlay { background: linear-gradient(to top, #000000, transparent); padding: 40px; position: absolute; bottom: 0; left: 0; right: 0; }
        .content { padding: 40px; background: #000000; }
        h1 { font-size: 48px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; margin: 0 0 20px 0; text-transform: uppercase; }
        p { font-size: 18px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px; }
        .button { display: inline-block; padding: 15px 30px; background: #ffffff; color: #000000 !important; font-weight: 900; text-transform: uppercase; text-decoration: none; letter-spacing: 0.1em; font-size: 12px; }
        .footer { padding: 40px; border-top: 1px solid #27272a; text-align: left; font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 0.2em; }
      `;
      structure = `
        <div class="container">
          <div class="hero">
            <div class="overlay">
              <div style="font-size: 12px; font-weight: 900; letter-spacing: 0.3em; margin-bottom: 10px; color: #3b82f6;">NORDIC SAUNA ARCHIVE</div>
              <h1>${subject}</h1>
            </div>
          </div>
          <div class="content">
            <p>${content}</p>
            <a href="${siteUrl}" class="button">${viewText}</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Nordic Sauna Map<br/><br/>
            Digital Heritage & Cultural Preservation<br/>
            Helsinki, Finland<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #ffffff; text-decoration: none;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    case "elegant":
      styles = `
        body { font-family: 'Playfair Display', serif; background: #fafaf9; margin: 0; padding: 0; color: #1c1917; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e7e5e4; }
        .header { padding: 60px 40px; text-align: center; border-bottom: 1px solid #f5f5f4; }
        .logo { font-size: 14px; font-weight: 400; letter-spacing: 0.5em; text-transform: uppercase; color: #78716c; margin-bottom: 20px; }
        .content { padding: 60px 80px; text-align: center; }
        .img-wrap { padding: 0 40px; margin-bottom: 40px; }
        .img-wrap img { width: 100%; height: auto; filter: grayscale(1); }
        h1 { font-size: 32px; font-weight: 400; font-style: italic; margin-bottom: 30px; color: #1c1917; }
        p { font-size: 16px; line-height: 1.8; color: #44403c; margin-bottom: 40px; font-family: 'Inter', sans-serif; }
        .button { display: inline-block; padding: 12px 40px; border: 1px solid #1c1917; color: #1c1917 !important; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-family: 'Inter', sans-serif; }
        .footer { padding: 40px; text-align: center; font-size: 10px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.2em; font-family: 'Inter', sans-serif; }
      `;
      structure = `
        <div class="container">
          <div class="header">
            <div class="logo">Nordic Sauna Map</div>
          </div>
          <div class="content">
            <div class="img-wrap"><img src="${finalImageUrl}" /></div>
            <h1>${subject}</h1>
            <p>${content}</p>
            <a href="${siteUrl}" class="button">${viewText}</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Archive Collection<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #78716c;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    case "minimal":
      styles = `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; margin: 0; padding: 0; color: #171717; }
        .container { max-width: 600px; margin: 0 auto; padding: 60px 40px; }
        .logo { font-weight: 800; font-size: 16px; margin-bottom: 80px; letter-spacing: -0.02em; }
        img { width: 100%; border-radius: 12px; margin-bottom: 40px; }
        h1 { font-size: 24px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.03em; }
        p { font-size: 15px; line-height: 1.6; color: #404040; margin-bottom: 40px; }
        .button { display: inline-block; padding: 16px 32px; background: #171717; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
        .footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #f5f5f5; font-size: 12px; color: #a3a3a3; }
      `;
      structure = `
        <div class="container">
          <div class="logo">Nordic Sauna Map.</div>
          <img src="${finalImageUrl}" />
          <h1>${subject}</h1>
          <p>${content}</p>
          <a href="${siteUrl}" class="button">${viewText}</a>
          <div class="footer">
            Sent by Nordic Sauna Map Archive<br/>
            <a href="${unsubscribeUrl}" style="color: #171717; text-decoration: none; font-weight: 600;">${unsubscribeText}</a>
          </div>
        </div>
      `;
      break;

    default: // classic
      styles = `
        body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #020617; margin: 0; padding: 0; background-color: #f8fafc; }
        .wrapper { width: 100%; max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 60px 48px; text-align: left; color: white; }
        .content { padding: 48px; }
        .footer { padding: 48px; text-align: center; font-size: 11px; color: #94a3b8; background: #f8fafc; text-transform: uppercase; letter-spacing: 0.1em; }
        .logo-text { font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; font-size: 20px; color: #ffffff; }
        .accent { color: #3b82f6; }
        h1 { font-size: 42px; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.04em; color: #020617; line-height: 1.1; text-align: left; }
        p { margin-bottom: 24px; font-size: 16px; color: #0f172a; white-space: pre-wrap; }
        .button { display: inline-block; padding: 20px 40px; background-color: #0f172a; color: white !important; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; }
      `;
      structure = `
        <div class="wrapper">
          <div class="header">
            <div class="logo-text">Nordic<span class="accent">Sauna</span>Map</div>
          </div>
          <div class="content">
            <img src="${finalImageUrl}" style="width: 100%; height: auto; border-radius: 24px; margin-bottom: 32px;" />
            <h1>${subject}</h1>
            <p>${content}</p>
            <div style="text-align: center; margin-top: 40px;">
              <a href="${siteUrl}" class="button">${viewText}</a>
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Nordic Sauna Map Archive<br/><br/>
            <a href="${unsubscribeUrl}" style="color: #64748b;">${unsubscribeText}</a>
          </div>
        </div>
      `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
        <style>${styles}</style>
    </head>
    <body>${structure}</body>
    </html>
  `;
}
