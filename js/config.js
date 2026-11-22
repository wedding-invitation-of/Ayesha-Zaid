/* ============================================================
   WEDDING CONFIGURATION  —  edit this file only.
   Every name, date, venue, link and family detail on the site
   is filled from here (the HTML holds the same text as a fallback).
   ============================================================ */
window.WEDDING_CONFIG = {

  // ---- Couple ------------------------------------------------
  bride: "Ayesha",
  groom: "Zaid",

  // ---- Date --------------------------------------------------
  // The countdown runs to this exact moment.
  // Format: YYYY-MM-DDTHH:MM:SS+HH:MM  (include the venue's timezone offset)
  countdownTo: "2026-12-27T16:30:00+05:30",
  dateText: "Saturday, 27th December 2026",   // main date badge
  shortDate: "27th December 2026",            // footer date

  // ---- Events ------------------------------------------------
  // mapsUrl: paste the Google Maps share link of each venue here.
  events: {
    nikah: {
      title: "Nikah Ceremony",
      date: "Saturday, 27th December 2026",
      time: "After Asar Namaz",
      venue: "Taj-ul-Masjid",
      address: "Taj-ul-Masajid Road, Bhopal, Madhya Pradesh",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taj-ul-Masajid+Bhopal"
    },
    walima: {
      title: "Walima Reception",
      date: "Sunday, 28th December 2026",
      time: "7:00 PM Onwards",
      venue: "Taj Hotel",
      address: "Banquet Hall, Bhopal, Madhya Pradesh",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Taj+Hotel+Bhopal"
    }
  },

  // ---- Families ----------------------------------------------
  families: {
    groom: { label: "From the Groom's Side", names: "Mr. & Mrs. Khan",  role: "(Parents of Zaid)" },
    bride: { label: "From the Bride's Side", names: "Mr. & Mrs. Ahmed", role: "(Parents of Ayesha)" },
    regards: "Khan & Ahmed Families"
  },

  // ---- Social links (use "" to hide an icon) -----------------
  social: {
    instagram: "#",
    facebook: "#",
    youtube: "#",
    whatsapp: "#"
  }
};
