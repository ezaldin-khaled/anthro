# Fix "Not secure" in the browser

The site works but the browser shows **Not secure** when HTTPS is missing, the certificate isn’t used, or there is mixed content. Fix it as follows.

**Quick checks in the browser:** Click the padlock or "Not secure" in the address bar and read the message (e.g. "Your connection is not private" / "Certificate invalid", or "Mixed content"). That tells you whether it’s a cert issue or mixed content.

---

## 1. Always use https://

Open the site as:

- **https://www.anthrotech.ae**
- **https://anthrotech.ae**

Do **not** use **http://** or the bare IP. If you use HTTP, the browser will show “Not secure” even if HTTPS is configured.

---

## 2. Redirect HTTP → HTTPS on the main nginx

Your main nginx (on the host) must listen on **443** with the Let’s Encrypt certificate and redirect port 80 to 443 for anthrotech.ae.

On the Droplet, check the site config:

```bash
sudo cat /etc/nginx/sites-enabled/anthrotech-acme
```

You should see:

1. A **server** block that **listen 80** and does **return 301 https://$host$request_uri** for anthrotech.ae / www.anthrotech.ae.
2. A **server** block that **listen 443 ssl** with:
   - **ssl_certificate** and **ssl_certificate_key** pointing to the certbot certs, e.g.:
     - `ssl_certificate     /etc/letsencrypt/live/anthrotech.ae/fullchain.pem;`
     - `ssl_certificate_key  /etc/letsencrypt/live/anthrotech.ae/privkey.pem;`
   - **server_name anthrotech.ae www.anthrotech.ae**
   - **proxy_pass http://127.0.0.1:9080**

If the 443 block is missing or uses different paths, fix it to match the example above and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 3. Confirm the certificate is used

On the Droplet:

```bash
curl -sI https://www.anthrotech.ae | head -5
```

You should see **HTTP/2 200** (or 301/302) and no SSL errors. If you see “SSL certificate problem” or similar, nginx is not serving the Let’s Encrypt cert for that host.

Check that the cert files exist:

```bash
sudo ls -la /etc/letsencrypt/live/anthrotech.ae/
```

You should see `fullchain.pem` and `privkey.pem`.

To see which certificate the server actually offers (and that it’s valid for your domain):

```bash
echo | openssl s_client -connect www.anthrotech.ae:443 -servername www.anthrotech.ae 2>/dev/null | openssl x509 -noout -subject -dates
```

You should see `subject=... CN = www.anthrotech.ae` (or anthrotech.ae) and dates that include today. If you see a different CN or “self-signed”, another server block may be handling 443 (e.g. default). Then run:

```bash
grep -r "listen.*443" /etc/nginx/
```

and ensure only the anthrotech.ae block serves that hostname with the Let’s Encrypt cert.

---

## 4. Add security headers (recommended)

Inside the **443** `server` block (before or after `location /`), add:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 5. Mixed content

If the address bar shows **https://** but the page is still “Not secure”, the page may be loading some resources over **HTTP** (mixed content). In the browser:

1. Open DevTools (F12) → **Network** tab.
2. Reload the page.
3. Check if any request has protocol **http** or is marked “Insecure”.

If you find any, fix the source (e.g. change `http://` to `https://` or use relative URLs). The site’s `index.html` includes `upgrade-insecure-requests` so relative URLs are upgraded to HTTPS after you redeploy.

---

## 6. Summary

| Check | Action |
|--------|--------|
| Open site with **https://** | Use https://www.anthrotech.ae or https://anthrotech.ae |
| Port 80 → 301 to https | In nginx, `return 301 https://$host$request_uri` for anthrotech.ae |
| Port 443 with valid cert | `ssl_certificate` / `ssl_certificate_key` = certbot path for anthrotech.ae |
| Reload nginx | `sudo nginx -t && sudo systemctl reload nginx` |

After this, the padlock should appear and “Not secure” should go away when you use **https://**. If it doesn’t, use the browser’s padlock/“Not secure” message and the **openssl** check above to see whether the problem is the certificate or mixed content.
