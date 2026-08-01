# Vercel deploy isolation
#
# - Git branch for Vercel: `vercel`
# - Git branch for Hostinger Node (evomi.shop): `main` ONLY
# - Do NOT connect Hostinger auto-deploy to the `vercel` branch
# - Backend/API/DB remain on Hostinger: https://api.evomi.shop
# - Frontend on Vercel: https://evomi-rama.vercel.app
#
# Vercel project env (Production + Preview):
#   NEXT_PUBLIC_URL=https://api.evomi.shop
#   NEXT_PUBLIC_API_URL=https://api.evomi.shop/api
#   NEXT_PUBLIC_SITE_URL=https://evomi-rama.vercel.app
