// Videos ka data yahan se change karo.
// youtubeId: YouTube video/short ki ID (e.g. "dQw4w9WgXcQ") -> thumbnail automatic aa jayegi
// thumb:     ya apni image do -> "/images/videos/v1.jpg" ya koi URL
// link:  video ka link (subscriber ke liye)

export const longVideos = Array.from({ length: 8 }, (_, i) => ({
  id: `long-${i + 1}`,
  title: `Long Video ${i + 1} | Professor Hakeem Ali Waqas`,
  youtubeId: "",
  thumb: "",
  link: "#",
}));

export const shortVideos = [
  { id: "s1", title: "Marz Ki Tashkhees 9 | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s2", title: "Kam Dev Ras | Heray Ke Kakh | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s3", title: "Enlarge Prostate Free Medicine 3 | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s4", title: "Jalaq ke Nuqsan 4 | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s5", title: "Marz Ki Tashkhees 8 | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s6", title: "Heray Or Sone ke kakh | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s7", title: "Majoon Shadi course | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
  { id: "s8", title: "Majoon Shadi course | Professor Hakeem Ali Waqas", youtubeId: "", thumb: "", link: "#" },
];
