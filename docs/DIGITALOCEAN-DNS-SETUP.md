# Switch anthrotech.ae to DigitalOcean DNS

Use this after you hit "Cannot add A/AAAA record when CDN is enabled" in Hostinger. Your domain stays registered at Hostinger; only DNS is managed by DigitalOcean. Email stays on Hostinger by re-adding the same mail records.

---

## Step 1 – Add domain in DigitalOcean

1. Log in to [cloud.digitalocean.com](https://cloud.digitalocean.com).
2. Go to **Networking** → **Domains** (or **DNS** in the left menu).
3. Click **Add Domain**.
4. **Enter domain:** `anthrotech.ae`
5. Choose **Add existing domain** (you already own it).
6. Click **Add Domain**.

DigitalOcean will show you **nameservers**, for example:

- `ns1.digitalocean.com`
- `ns2.digitalocean.com`
- `ns3.digitalocean.com`

**Copy these** – you’ll set them in Hostinger in Step 3.

---

## Step 2 – Add DNS records in DigitalOcean

In the domain **anthrotech.ae** → **Records** tab, add these one by one.

### Website (point to your Droplet)

| Type | Hostname | Value / Redirects to | TTL |
|------|----------|----------------------|-----|
| A    | @        | 164.90.215.173       | 3600 |
| A    | www      | 164.90.215.173       | 3600 |

*(Replace 164.90.215.173 with your Droplet IP if it’s different.)*

### Email (Hostinger – keep exactly as below)

| Type | Hostname | Value / Mail server   | TTL  | Priority (if asked) |
|------|----------|------------------------|------|------------------------|
| MX   | @        | mx1.hostinger.com      | 14400 | 5  |
| MX   | @        | mx2.hostinger.com      | 14400 | 10 |

| Type | Hostname                    | Value                                      | TTL   |
|------|-----------------------------|--------------------------------------------|-------|
| TXT  | @                           | v=spf1 include:_spf.mail.hostinger.com ~all | 3600  |
| TXT  | _dmarc                      | v=DMARC1; p=none                           | 3600  |

| Type | Hostname                     | Value / Redirects to                 | TTL  |
|------|------------------------------|--------------------------------------|------|
| CNAME | hostingermail-a._domainkey  | hostingermail-a.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-b._domainkey  | hostingermail-b.dkim.mail.hostinger.com | 300 |
| CNAME | hostingermail-c._domainkey  | hostingermail-c.dkim.mail.hostinger.com | 300 |
| CNAME | autodiscover                 | autodiscover.mail.hostinger.com       | 300  |
| CNAME | autoconfig                  | autoconfig.mail.hostinger.com         | 300  |

### Optional – FTP (only if you still use Hostinger FTP)

| Type | Hostname | Value           | TTL  |
|------|----------|-----------------|------|
| A    | ftp      | 153.92.220.48   | 1800 |

### CAA (optional – limits who can issue SSL certs)

You can add these if DigitalOcean supports CAA; otherwise skip. They allow Let’s Encrypt (which Caddy uses):

- Type: CAA, Hostname: @, Value: `0 issue "letsencrypt.org"`
- Type: CAA, Hostname: @, Value: `0 issuewild "letsencrypt.org"`

*(Other CAA values from Hostinger are optional.)*

---

## Step 3 – Change nameservers at Hostinger

1. Log in to **Hostinger**.
2. Go to **Domains** → **anthrotech.ae** → **Nameservers** (or **Manage** → **Change nameservers**).
3. Select **Custom nameservers** (or “Use different nameservers”).
4. Enter DigitalOcean’s three nameservers, for example:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
5. Save.

DNS can take from **5 minutes to 48 hours** to switch; often it’s within 30–60 minutes.

---

## Step 4 – Check

- **DNS:** [dnschecker.org](https://dnschecker.org) → check **A** for `anthrotech.ae` and `www.anthrotech.ae` → should show **164.90.215.173**.
- **Site:** Open `https://anthrotech.ae` and `https://www.anthrotech.ae` → should load your Droplet site.
- **Email:** Send a test from `you@anthrotech.ae` → should still send/receive via Hostinger.

---

## Summary

| Where            | What you did |
|------------------|--------------|
| DigitalOcean DNS | Added A for @ and www → Droplet IP; added MX, TXT, CNAME for Hostinger email. |
| Hostinger        | Changed nameservers to DigitalOcean only. No CDN/DNS edits needed anymore. |

After propagation, the domain uses DigitalOcean for DNS, the site points to your Droplet, and email keeps working on Hostinger.
