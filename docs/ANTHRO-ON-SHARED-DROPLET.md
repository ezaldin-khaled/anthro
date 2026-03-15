# Run Anthro on a Droplet that already uses port 80/443

When other containers (or nginx/Traefik) use port 80 and 443, run the anthro stack on **8080** and **8443** and route traffic from your main proxy.

---

## 1. Start anthro on 8080 and 8443

```bash
cd ~/anthro
./start-shared.sh
# or: ANTHRO_HTTP_PORT=8080 ANTHRO_HTTPS_PORT=8443 docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
```

Caddy will listen on:
- **8080** (HTTP) – e.g. http://localhost:8080
- **8443** (HTTPS) – e.g. https://localhost:8443 (Caddy’s own certificate for anthrotech.ae)

---

## 2. Route anthrotech.ae from your main proxy

Your existing service that listens on **80** and **443** must send **anthrotech.ae** and **www.anthrotech.ae** to the anthro stack.

### Option A – Main proxy does SSL and forwards HTTP

In your main reverse proxy (nginx, Traefik, Caddy, etc.) add a server/vhost:

- **Server names:** `anthrotech.ae` and `www.anthrotech.ae`
- **Backend:** `http://127.0.0.1:8080` (or `http://host.docker.internal:8080` if the proxy runs in Docker and anthro is on the host)

Your main proxy terminates HTTPS and forwards plain HTTP to port 8080.

### Option B – Main proxy forwards HTTPS (TLS passthrough)

If your main proxy supports TLS passthrough:

- For **anthrotech.ae** / **www.anthrotech.ae**, forward TCP 443 to **127.0.0.1:8443** (or the anthro Caddy container).
- Caddy on 8443 will handle TLS and the site. Port 80 can redirect to 443 in the main proxy, then 443 → 8443.

### Option C – Main proxy is nginx

Example nginx server block (on the host or in the container that has 80/443):

```nginx
server {
    listen 80;
    server_name anthrotech.ae www.anthrotech.ae;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name anthrotech.ae www.anthrotech.ae;
    # Your SSL cert here, or use certbot
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then reload nginx. Anthro Caddy will receive HTTP on 8080; nginx handles HTTPS on 443.

---

## 3. Check

- Open **https://anthrotech.ae** (and **https://www.anthrotech.ae**).
- They should hit your main proxy (80/443), which forwards to anthro on 8080 (or 8443).

---

## Summary

| Role              | Port  | Use |
|-------------------|-------|-----|
| Other containers  | 80, 443 | Your existing sites / proxy. |
| Anthro (Caddy)    | 8080, 8443 | Anthro HTTP and HTTPS. |
| Main proxy        | 80, 443 | Listens for anthrotech.ae and forwards to 127.0.0.1:8080 (or 8443). |
