# Fix "Not secure" and 400 on the Droplet

## 1. Open ports 80 and 443

Caddy needs **port 80** open to get a Let's Encrypt certificate. On the Droplet run:

```bash
# If ufw is active:
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
ufw status

# Also check DigitalOcean: Networking → Firewall. Add HTTP (80) and HTTPS (443) if you use a DO firewall.
```

## 2. Let Caddy get a fresh certificate

If Caddy started when port 80 was closed, it never got a real certificate. Restart and force it to retry:

```bash
cd ~/anthro

# Remove Caddy's data so it fetches new certs (optional but recommended)
docker compose -f docker-compose.prod.yml stop caddy
docker volume rm anthro_caddy_data 2>/dev/null || true

# Pull latest (includes Caddyfile fix for 400)
git pull origin main

# Start again – Caddy will request a new certificate
docker compose -f docker-compose.prod.yml up -d
```

Wait 1–2 minutes, then check Caddy logs:

```bash
docker compose -f docker-compose.prod.yml logs caddy
```

Look for lines like `certificate obtained successfully` or any `acme` / `Let's Encrypt` errors. If you see errors about "connection refused" or "timeout", port 80 is still not reachable from the internet.

## 3. Test

- Open **https://anthrotech.ae** and **https://www.anthrotech.ae** in a fresh tab (or incognito).
- You should see the padlock and no 400.

If you still get "Not secure", the certificate is still failing. Make sure:

- DNS for **anthrotech.ae** and **www.anthrotech.ae** points to this Droplet’s IP (`dig anthrotech.ae A +short`).
- Nothing else (another Nginx, Apache, or firewall) is using port 80 or 443 on the Droplet.
