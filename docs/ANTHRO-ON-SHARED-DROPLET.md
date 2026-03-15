# Run Anthro on a Droplet that already uses port 80/443

When other containers (or nginx/Traefik) use port 80 and 443, run the anthro stack on **9080** and **9443** (or your own ports) and route traffic from your main proxy.

---

## 1. Start anthro on 9080 and 9443

```bash
cd ~/anthro
./start-shared.sh
docker compose -f docker-compose.prod.yml ps
```

Caddy will listen on:
- **9080** (HTTP) – e.g. http://localhost:9080
- **9443** (HTTPS) – e.g. https://localhost:9443 (Caddy’s own certificate for anthrotech.ae)

If 9080 or 9443 are already in use, pick another pair and run:
```bash
ANTHRO_HTTP_PORT=18080 ANTHRO_HTTPS_PORT=18443 ./start-shared.sh
```

---

## 2. Route anthrotech.ae from your main proxy (required)

Your existing service on **80** and **443** must send **anthrotech.ae** and **www.anthrotech.ae** to **http://127.0.0.1:9080**. The anthro Caddyfile is set to **tls off** so it does not try to get a certificate (your main proxy was returning **403** for `/.well-known/acme-challenge/`, so ACME could not succeed). The main proxy must do SSL (e.g. certbot) and forward HTTP to 9080.

### Option A – Main proxy does SSL and forwards HTTP (recommended)

- **Server names:** `anthrotech.ae` and `www.anthrotech.ae`
- **Backend:** `http://127.0.0.1:9080`
- **SSL:** Obtain the certificate on the main proxy (e.g. certbot for nginx, or your proxy’s ACME).

### Option B – Main proxy forwards HTTPS (TLS passthrough)

If your main proxy supports TLS passthrough:

- For **anthrotech.ae** / **www.anthrotech.ae**, forward TCP 443 to **127.0.0.1:9443** (or the anthro Caddy container).
- Caddy on 9443 will handle TLS and the site. Port 80 can redirect to 443 in the main proxy, then 443 → 9443.

### Option C – Main proxy is nginx

Example: get a cert with certbot, then proxy to anthro on 9080.

```nginx
server {
    listen 80;
    server_name anthrotech.ae www.anthrotech.ae;
    # Let certbot do HTTP-01 for this server (certbot will add a location)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;  # or your certbot webroot
    }
    location / {
        return 301 https://$host$request_uri;
    }
}
server {
    listen 443 ssl;
    server_name anthrotech.ae www.anthrotech.ae;
    ssl_certificate     /etc/letsencrypt/live/anthrotech.ae/fullchain.pem;
    ssl_certificate_key  /etc/letsencrypt/live/anthrotech.ae/privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:9080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then reload nginx. Anthro Caddy (with `tls off`) receives HTTP on 9080; nginx handles HTTPS on 443.

---

## 3. Check

- Open **https://anthrotech.ae** (and **https://www.anthrotech.ae**).
- They should hit your main proxy (80/443), which forwards to anthro on 8080 (or 8443).

---

## Summary

| Role              | Port  | Use |
|-------------------|-------|-----|
| Other containers  | 80, 443 | Your existing sites / proxy. |
| Anthro (Caddy)    | 9080, 9443 | Anthro HTTP and HTTPS. |
| Main proxy        | 80, 443 | Listens for anthrotech.ae and forwards to 127.0.0.1:9080 (or 9443). |
