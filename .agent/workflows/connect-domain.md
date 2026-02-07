---
description: Guide to connecting a custom domain (rethinkclub.com) to Vercel
---

# Connect Custom Domain (`rethinkclub.com`)

To make your Vercel deployment accessible at your custom domain, follow these two main steps:

## Step 1: Configure Vercel
1. Log in to your **Vercel Dashboard**.
2. Click on your **rethink-club-frontend** project.
3. Go to **Settings** (top menu) -> **Domains** (left sidebar).
4. Enter `rethinkclub.com` in the input field and click **Add**.
5. Vercel will likely suggest adding `www.rethinkclub.com` as well. Accept this option so both work.

## Step 2: Update DNS Records
You need to log in to the website where you bought your domain (e.g., GoDaddy, Namecheap, Google Domains) and update the DNS records to point to Vercel.

**Option A: Recommended (A Record + CNAME)**
This allows you to keep your email/other services working if you have them.

| Type  | Name / Host | Value / Data |
| :--- | :--- | :--- |
| **A** | `@` (or leave blank) | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

**Option B: Nameservers (Easiest if you don't use email)**
Change your domain's **Nameservers** to Vercel's. This gives Vercel full control over your DNS.
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

## Step 3: Wait
*   DNS changes can take anywhere from a few minutes to 24 hours to propagate worldwide.
*   Once configured, Vercel will automatically generate a valid SSL certificate (HTTPS) for you.
