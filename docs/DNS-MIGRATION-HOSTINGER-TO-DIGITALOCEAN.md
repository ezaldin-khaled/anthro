# Moving anthrotech.ae from Hostinger to DigitalOcean (keep email on Hostinger)

Your domain is on Hostinger. You want the **website** to run on DigitalOcean and **email** to stay on Hostinger. Only the web records change; all mail records stay as they are.

---

## Records to KEEP (do not change) – email stays on Hostinger

Leave these exactly as they are so email keeps working and stays configured correctly:

| Type  | Name / Host     | Value / Target                          | TTL  |
|-------|-----------------|------------------------------------------|------|
| MX    | @               | 5 mx1.hostinger.com                      | 14400 |
| MX    | @               | 10 mx2.hostinger.com                     | 14400 |
| TXT   | @               | "v=spf1 include:_spf.mail.hostinger.com ~all" | 3600 |
| CNAME | hostingermail-a._domainkey | hostingermail-a.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-b._domainkey | hostingermail-b.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-c._domainkey | hostingermail-c.dkim.mail.hostinger.com | 300 |
| TXT   | _dmarc          | "v=DMARC1; p=none"                       | 3600 |
| CNAME | autodiscover    | autodiscover.mail.hostinger.com          | 300  |
| CNAME | autoconfig      | autoconfig.mail.hostinger.com            | 300  |

Optional: keep **ftp** (A → 153.92.220.48) if you still use Hostinger FTP. You can delete it later if you don’t.

Keep all **CAA** records as they are (they allow Let’s Encrypt, which DigitalOcean can use for SSL).

---

## Records to CHANGE – point the website to DigitalOcean

Only these two are for the **website**. Update them in Hostinger DNS after your app is live on DigitalOcean.

### 1. Root domain (`@` – anthrotech.ae)

**Current (Hostinger):**
- Type: **ALIAS**
- Name: `@`
- Value: `anthrotech.ae.cdn.hstgr.net`

**New (DigitalOcean):**

- **If you use DigitalOcean App Platform:**
  - After deploy, App Platform gives you a URL like `your-app-xxxxx.ondigitalocean.app`.
  - Not all DNS panels support ALIAS/ANAME for root. Options:
    - **Option A:** If your DNS (e.g. Hostinger) supports **ALIAS** or **ANAME**, set:
      - Type: **ALIAS** (or ANAME)
      - Name: `@`
      - Value: `your-app-xxxxx.ondigitalocean.app`
    - **Option B:** If not, use the **IP** that App Platform shows for your app (if they give one), and set:
      - Type: **A**
      - Name: `@`
      - Value: that IP

- **If you use a Droplet (VPS) and Docker:**
  - Type: **A**
  - Name: `@`
  - Value: your Droplet’s public IP (e.g. `164.92.xxx.xxx`)

### 2. www (www.anthrotech.ae)

**Current (Hostinger):**
- Type: **CNAME**
- Name: `www`
- Value: `www.anthrotech.ae.cdn.hstgr.net`

**New (DigitalOcean):**

- **If you use App Platform with a hostname like `your-app.ondigitalocean.app`:**
  - Type: **CNAME**
  - Name: `www`
  - Value: `your-app-xxxxx.ondigitalocean.app`  
  (same as the root target, no “www” in the value)

- **If you use a Droplet:**
  - Type: **CNAME**
  - Name: `www`
  - Value: `anthrotech.ae`  
  (so www points to the same place as root),  
  **or**
  - Type: **A**
  - Name: `www`
  - Value: your Droplet’s public IP (same as `@`)

---

## Checklist

1. Deploy the app on DigitalOcean (Docker or App Platform) and note:
   - The app URL (e.g. `xxx.ondigitalocean.app`) **or**
   - The Droplet IP
2. In Hostinger DNS, **do not touch** any MX, TXT (SPF, DMARC), DKIM CNAMEs, autodiscover, autoconfig, or CAA.
3. Change only:
   - **@** → ALIAS/ANAME or A to your DigitalOcean app/droplet.
   - **www** → CNAME (or A) to the same target.
4. Wait 5–15 minutes (TTL 300) and check:
   - `https://anthrotech.ae` and `https://www.anthrotech.ae` open your DigitalOcean app.
   - Send a test email from your Hostinger mailbox (e.g. `you@anthrotech.ae`) to confirm mail still works.

---

## SSL (HTTPS)

- DigitalOcean (App Platform or Droplet with a reverse proxy) can issue Let’s Encrypt certificates.
- Your existing CAA records already allow `letsencrypt.org`, so no CAA changes are needed for SSL.

---

## Summary

| Purpose   | Action   | Records |
|----------|----------|---------|
| Email    | **Keep** | MX, SPF, DKIM (3 CNAMEs), DMARC, autodiscover, autoconfig, CAA |
| Website  | **Change** | `@` and `www` → DigitalOcean (ALIAS/A + CNAME or A) |

After the change, the site is served from DigitalOcean and email continues to work from Hostinger.
