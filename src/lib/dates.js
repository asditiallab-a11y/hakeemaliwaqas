// Admin ki date "2026-04-10" -> "April 10, 2026". Purani static dates (pehle se likhi hui) jaisi hain waisi hi rehti hain.
export function fmtDate(d = "") {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
