# Sage Garden Nikah — invitation website

Open `index.html` with the VS Code "Live Server" extension (or run `python3 -m http.server` in this folder).
No build step, no installs. GSAP + ScrollTrigger and all fonts are bundled locally.

## Edit your details
Only `js/config.js`: names, date/time, countdown target, venues, Google Maps links, families, social links.

## Replace images
- Venue photos: overwrite `assets/img/venue-nikah.webp` and `venue-walima.webp` with your real venue photos (~680px wide).
- Your original ZIP assets are kept untouched in `assets/original/`.

## Structure
index.html · css/style.css · js/main.js · js/config.js · vendor/ (GSAP) · assets/img, fonts
