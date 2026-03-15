# Fix certbot 403 for /.well-known/acme-challenge/

Let's Encrypt gets **403** when it tries to read the challenge file. The program listening on **port 80** for your server must serve `/.well-known/acme-challenge/` and allow access (no 403).

---

## If nginx on the host is on port 80 (quick steps)

1. Create a snippet or new site that serves only ACME for anthrotech.ae on port 80:

```bash
sudo mkdir -p /var/www/html
sudo chown www-data:www-data /var/www/html
```

2. Create a new config file, e.g. `/etc/nginx/sites-available/anthrotech-acme`:

```nginx
server {
    listen 80;
    server_name anthrotech.ae www.anthrotech.ae;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
```

3. Enable it and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/anthrotech-acme /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

4. Run certbot:

```bash
sudo certbot certonly --webroot -w /var/www/html -d anthrotech.ae -d www.anthrotech.ae
```

5. After you have the cert, replace the content of `anthrotech-acme` (or add a 443 server) with the full config that does SSL and `proxy_pass http://127.0.0.1:9080` (see `docs/main-proxy-anthrotech.example.conf`). Reload nginx again.

---

## 1. Find what is using port 80

On the Droplet:

```bash
ss -tlnp | grep ':80 '
# or
lsof -i :80
```

You might see **nginx** (host or container), **Traefik**, **Caddy**, or another proxy.

---

## 2. Allow ACME and run certbot

### If the main proxy is **nginx on the host**

Create or edit a server block that listens on 80 for **anthrotech.ae** and **www.anthrotech.ae** and **serves only** the ACME path (so certbot can succeed). Example:

```nginx
# /etc/nginx/sites-available/anthrotech-acme  (or inside your main config)
server {
    listen 80;
    server_name anthrotech.ae www.anthrotech.ae;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }

    location / {
        return 200 'ok';
        add_header Content-Type text/plain;
    }
}
```

Then:

```bash
mkdir -p /var/www/html
chown -R www-data:www-data /var/www/html   # or nginx:nginx, depending on your system
nginx -t && systemctl reload nginx
certbot certonly --webroot -w /var/www/html -d anthrotech.ae -d www.anthrotech.ae
```

After you have the cert, change this server block to your real config (HTTPS + `proxy_pass http://127.0.0.1:9080`).

### If the main proxy is **nginx in Docker**

The container must serve `/.well-known/acme-challenge/` from a directory on the host where certbot writes. Example:

```bash
mkdir -p /var/www/certbot
certbot certonly --webroot -w /var/www/certbot -d anthrotech.ae -d www.anthrotech.ae
```

That will fail with 403 until the **nginx container** has a `location /.well-known/acme-challenge/` with `root /var/www/certbot` and that path is **mounted** from the host, e.g.:

```yaml
volumes:
  - /var/www/certbot:/var/www/certbot:ro
```

So: add the location, mount `/var/www/certbot` into the container, reload the proxy, then run certbot with `-w /var/www/certbot`.

### If the main proxy is **Traefik / Caddy / other**

- **Traefik:** use the HTTP challenge and ensure no middleware returns 403 for `/.well-known/acme-challenge/`.
- **Caddy:** it normally handles ACME itself; if you use a different front proxy, that proxy must forward `/.well-known/acme-challenge/` to the service that has the challenge (or serve a webroot where certbot writes).

---

## 3. Summary

- **403** = the process on port 80 is refusing access to `/.well-known/acme-challenge/`.
- Add a **location** (or equivalent) for that path with **root** pointing to the **same directory** you pass to certbot as `-w`.
- Reload the proxy, then run **certbot** again with that webroot.
