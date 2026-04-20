# Shared KVM Deploy Playbook (No Port Conflicts)

Use this guide every time you deploy a new project on the same VPS/KVM.
Goal: keep one public entrypoint on `80/443`, and avoid container port collisions.

---

## Core rule

- Keep **host nginx** as the only service listening on public ports:
  - `80` (HTTP)
  - `443` (HTTPS)
- Every project runs on **internal unique ports** (example: `9080`, `9180`, `9280`...).
- Host nginx routes each domain to its project internal port.

---

## Standard architecture

```text
Internet -> Host nginx (80/443) -> Project A (127.0.0.1:9080)
                              -> Project B (127.0.0.1:9180)
                              -> Project C (127.0.0.1:9280)
```

---

## 1) Port allocation policy

Reserve a unique HTTP port per project:

- Anthro: `9080`
- Next project: `9180`
- Next project: `9280`

Optional HTTPS backend port pattern (if needed internally): `9443`, `9543`, `9643`, etc.

Before selecting a port, check current usage:

```bash
sudo ss -ltnp
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

---

## 2) Per-project deployment checklist

### A. Project runtime

1. Put project in its own folder:
   - `/root/project-a`
   - `/root/project-b`
2. Add env file (`.env`) with all required secrets.
3. Start project containers bound to unique internal port(s).

### B. Nginx routing

Create one nginx vhost per domain:

- File: `/etc/nginx/sites-available/<project-domain>`
- Symlink: `/etc/nginx/sites-enabled/<project-domain>`
- `proxy_pass http://127.0.0.1:<project_http_port>;`

Always test/reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### C. SSL

Issue cert (webroot mode):

```bash
sudo certbot certonly --webroot -w /var/www/html -d example.com -d www.example.com
sudo nginx -t && sudo systemctl reload nginx
```

---

## 3) DNS checklist (Hostinger or any DNS provider)

For each domain:

- `A @ -> <KVM_PUBLIC_IP>`
- `A www -> <KVM_PUBLIC_IP>`

Keep email records (MX/SPF/DKIM/DMARC) unchanged unless mail is migrated.

---

## 4) Reusable nginx template

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://127.0.0.1:9180;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5) Preflight checks (before go-live)

Run on server:

```bash
sudo nginx -t
sudo ss -ltnp | grep -E ':80|:443|:9080|:9180|:9280'
curl -I -H "Host: example.com" http://127.0.0.1
curl -kI -H "Host: example.com" https://127.0.0.1
```

Run externally:

```bash
curl -4I https://example.com
curl -4I https://www.example.com
```

---

## 6) Common mistakes to avoid

- Running multiple projects directly on host `80/443`.
- Forgetting to set unique ports per project.
- Using `proxy_pass https://127.0.0.1:<port>` when backend is HTTP.
- Missing `.env` variables (SMTP/admin/JWT, etc.).
- Editing DNS mail records by accident while changing web records.

---

## 7) Recommended convention table

Keep a simple registry (update this when adding projects):

| Project | Domain | Internal HTTP Port | Internal HTTPS Port (optional) | Path |
|--------|--------|--------------------|---------------------------------|------|
| Anthro | anthrotech.ae | 9080 | 9443 | `/root/anthro` |
| Project 2 | TBD | 9180 | 9543 | `/root/project2` |
| Project 3 | TBD | 9280 | 9643 | `/root/project3` |

---

## 8) One-command deploy pattern

For each project, keep a deploy script that does:

1. `git pull --ff-only`
2. `docker compose up -d --build`
3. `docker compose ps`

This keeps deployments consistent and avoids manual mistakes.
