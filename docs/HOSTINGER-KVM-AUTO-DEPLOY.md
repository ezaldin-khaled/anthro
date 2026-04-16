# Hostinger KVM Auto Deploy (Shared Proxy + GitHub Actions)

Use this guide when your Hostinger KVM runs multiple projects and host nginx already owns ports `80/443`.

In this model:
- Host nginx terminates HTTPS for `anthrotech.ae`.
- Anthro runs in Docker on internal ports (`9080/9443`) via `./start-shared.sh`.
- GitHub Actions deploys automatically on every push to `main` through SSH.

---

## 1) Lock the shared-proxy contract

Anthro container port target must stay:
- `proxy_pass http://127.0.0.1:9080;`

Use the example in `docs/main-proxy-anthrotech.example.conf` and apply it on the KVM:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Check for conflicting `443` hosts:

```bash
grep -r "listen.*443" /etc/nginx/
```

---

## 2) Install server deploy script (one-time)

From your KVM shell:

```bash
cd ~/anthro
chmod +x scripts/deploy-hostinger.sh
cp scripts/deploy-hostinger.sh ~/deploy-anthro.sh
chmod +x ~/deploy-anthro.sh
```

Run once manually to verify:

```bash
~/deploy-anthro.sh
```

The script:
- fast-forwards to `origin/main` (no destructive reset)
- runs `./start-shared.sh --build`
- prints `docker compose ps`

---

## 3) Configure GitHub Actions secrets

In GitHub repository settings, add:
- `HOSTINGER_HOST` (KVM IP or domain)
- `HOSTINGER_USER` (usually `root` or deploy user)
- `HOSTINGER_SSH_KEY` (private key used by Actions)
- `HOSTINGER_PORT` (optional, defaults to `22`)

Workflow file: `.github/workflows/deploy-hostinger.yml`

Trigger:
- push to `main`
- optional manual run (`workflow_dispatch`)

---

## 4) First automated deploy test

1. Push a tiny commit to `main`.
2. Open GitHub Actions and watch `Deploy to Hostinger KVM`.
3. On KVM, verify:

```bash
cd ~/anthro
docker compose -f docker-compose.prod.yml ps
curl -I https://anthrotech.ae
```

4. Smoke-test:
- Contact form email delivery (SMTP backend).
- Admin login (`/admin/login`).

---

## 5) Manual fallback

If CI is down, deploy directly on KVM:

```bash
~/deploy-anthro.sh
```

---

## 6) Rollback procedure

Find a known-good commit:

```bash
cd ~/anthro
git log --oneline -n 20
```

Checkout and rebuild:

```bash
cd ~/anthro
git checkout <last-good-commit>
./start-shared.sh --build
```

When ready to return to latest:

```bash
cd ~/anthro
git checkout main
git pull --ff-only
./start-shared.sh --build
```

---

## 7) Quick diagnostics

```bash
cd ~/anthro
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200
sudo systemctl status nginx --no-pager
sudo nginx -t
echo | openssl s_client -connect anthrotech.ae:443 -servername anthrotech.ae 2>/dev/null | openssl x509 -noout -subject -dates
```
