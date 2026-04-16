# Deploy Anthro on a DigitalOcean Droplet (step by step)

Use this guide to run the site on a dedicated Droplet with Docker and HTTPS (Caddy + Let's Encrypt).

If your host already runs multiple projects behind nginx on `80/443`, use the shared-host auto-deploy guide instead:
- `docs/HOSTINGER-KVM-AUTO-DEPLOY.md`

---

## What you need before starting

- A **DigitalOcean** account
- Your **anthro** code pushed to **GitHub** (so the Droplet can clone it)
- Your **domain** (e.g. anthrotech.ae) – we’ll point it to the Droplet
- These values ready (from Hostinger / your notes):
  - **SMTP**: `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO` (for contact form email)
  - **Admin**: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a long random **JWT_SECRET** (e.g. 32+ characters)

---

## Step 1 – Create the Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com).
2. Click **Create** → **Droplets**.
3. Choose:
   - **Image:** Ubuntu 24.04 (LTS).
   - **Plan:** Basic shared CPU; **Regular** – at least **1 GB RAM / 1 CPU** (e.g. $6/mo). More is better if you expect traffic.
   - **Datacenter:** Pick one close to your users (e.g. Frankfurt, Singapore).
   - **Authentication:** SSH key (recommended) or password.
     - If SSH key: add your public key if you haven’t already.
     - If password: you’ll get a root password by email; change it after first login.
4. **Hostname:** e.g. `anthro-prod`.
5. Click **Create Droplet**.
6. When it’s ready, note the **public IP** (e.g. `164.92.xxx.xxx`). You’ll use this everywhere below.

---

## Step 2 – Point your domain to the Droplet (DNS)

Do this so the domain reaches the Droplet and Caddy can get an HTTPS certificate.

1. In **Hostinger** go to **Domains** → **anthrotech.ae** → **DNS / Manage DNS**.
2. Edit the **root (@)** record:
   - Type: **A**
   - Name: `@`
   - Value: **your Droplet IP** (from Step 1)
   - TTL: 300 (or leave default). Save.
3. Edit the **www** record:
   - Type: **A**
   - Name: `www`
   - Value: **same Droplet IP**
   - TTL: 300. Save.

Do **not** change MX, TXT, DKIM, autodiscover, autoconfig, or CAA – keep email on Hostinger.

Wait **5–10 minutes** (or until your DNS checker shows the new A records).

---

## Step 3 – SSH into the Droplet

From your own computer (terminal or PowerShell):

```bash
ssh root@YOUR_DROPLET_IP
```

Replace `YOUR_DROPLET_IP` with the IP from Step 1. Accept the host key if asked. Log in with your SSH key or password.

You should see a prompt like `root@anthro-prod:~#`.

---

## Step 4 – Install Docker and Docker Compose

Run these commands one by one on the Droplet:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Start Docker and enable on boot
systemctl start docker && systemctl enable docker

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Check
docker --version
docker compose version
```

You should see version numbers for both.

---

## Step 5 – Clone your project and set the domain in Caddy

Replace `YOUR_GITHUB_USER` and `YOUR_REPO` with your real GitHub username and repo (e.g. `ezaldin-khaled/anthro` or `yourusername/anthro-web`). If the repo is private, you’ll need a token or deploy key.

```bash
cd /root
git clone https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git anthro
cd anthro
```

If your repo is the whole workspace (e.g. `anthro-web`) and the app is in an `anthro` folder:

```bash
cd /root
git clone https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git
cd YOUR_REPO/anthro
```

Then set the domain in the Caddyfile (use your real domain):

```bash
nano Caddyfile
```

Change the first line to your domain, for example:

```
anthrotech.ae, www.anthrotech.ae {
  reverse_proxy frontend:80
}
```

Save (Ctrl+O, Enter) and exit (Ctrl+X).

---

## Step 6 – Create the `.env` file on the Droplet

Create the env file that Docker Compose will use:

```bash
nano .env
```

Paste the following and **replace every value** with your real ones (no quotes around values):

```env
# Hostinger SMTP (contact form emails)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=your-email@anthrotech.ae
SMTP_PASS=your-email-password
CONTACT_TO=hello@anthrotech.ae

# Admin dashboard login
ADMIN_EMAIL=admin@anthrotech.ae
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-long-random-secret-at-least-32-characters
```

- Use the same Hostinger mailbox for `SMTP_USER` / `SMTP_PASS` (and optionally `CONTACT_TO`).
- Use a **strong** `ADMIN_PASSWORD` and a **long random** `JWT_SECRET` (e.g. run `openssl rand -base64 32` and paste it).

Save (Ctrl+O, Enter) and exit (Ctrl+X).

---

## Step 7 – Build and start the app (production with HTTPS)

From the same directory (project root where `docker-compose.prod.yml` and `Caddyfile` are):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The first run will:

- Build the frontend and backend images
- Pull Caddy
- Start Caddy, frontend, and backend
- Caddy will request Let’s Encrypt certificates for your domain (HTTP must be reachable on port 80; DNS must already point to this Droplet)

Wait 1–2 minutes, then check:

```bash
docker compose -f docker-compose.prod.yml ps
```

All three services (caddy, frontend, backend) should be “Up”.

---

## Step 8 – Check the site and HTTPS

1. In the browser open:
   - `https://anthrotech.ae`
   - `https://www.anthrotech.ae`
2. You should see the site over HTTPS (padlock).
3. Test:
   - Contact form (sends via Hostinger SMTP)
   - `/admin/login` – log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`

If HTTPS doesn’t work:

- Confirm DNS: `dig anthrotech.ae` or [dnschecker.org](https://dnschecker.org) – A record should be the Droplet IP.
- Check Caddy logs: `docker compose -f docker-compose.prod.yml logs caddy`
- Ensure ports 80 and 443 are open (DigitalOcean firewall: add HTTP and HTTPS if you use a firewall).

---

## Step 9 – (Optional) Firewall on the Droplet

To allow only HTTP, HTTPS, and SSH:

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## Useful commands (after deploy)

| Task | Command |
|------|--------|
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Restart all | `docker compose -f docker-compose.prod.yml restart` |
| Stop | `docker compose -f docker-compose.prod.yml down` |
| Update app (after git push) | `git pull && docker compose -f docker-compose.prod.yml up -d --build` |

---

## Summary checklist

1. Create Droplet (Ubuntu 24.04, note IP).
2. In Hostinger DNS set **A** for `@` and **www** to the Droplet IP (keep all email records).
3. SSH: `ssh root@DROPLET_IP`.
4. Install Docker + Docker Compose.
5. Clone repo, `cd` into the `anthro` app directory.
6. Edit `Caddyfile` so the domain is `anthrotech.ae` (and www).
7. Create `.env` with SMTP, admin, and JWT_SECRET.
8. Run: `docker compose -f docker-compose.prod.yml up -d --build`.
9. Open `https://anthrotech.ae` and test site + admin login.

After this, the site runs on the Droplet with HTTPS, and email stays on Hostinger.
