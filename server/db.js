import dns from "node:dns";
import net from "node:net";
import mongoose from "mongoose";

// Windows par Node aksar IPv6 pehle try karta hai aur Atlas tak pohanchne mein latak jata hai
dns.setDefaultResultOrder("ipv4first");

// Agar ISP ka DNS "mongodb+srv://" resolve nahi karta to .env mein likho:  DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) {
  const list = process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length) dns.setServers(list);
}

const tcpCheck = (host, port, ms = 6000) =>
  new Promise((resolve) => {
    const sock = net.connect({ host, port, family: 4 });
    const done = (ok, why) => {
      sock.destroy();
      resolve({ ok, why });
    };
    sock.setTimeout(ms, () => done(false, "timeout"));
    sock.once("connect", () => done(true));
    sock.once("error", (e) => done(false, e.code || e.message));
  });

// Connection fail hone par asli wajah dhoondta hai (DNS? port block? user/password?)
export async function diagnoseConnection(err) {
  const uri = process.env.MONGODB_URI || "";
  const lines = [];
  const msg = String(err?.message || "");

  if (/bad auth|authentication failed/i.test(msg)) {
    lines.push("-> USER/PASSWORD galat hai. Atlas > Database Access mein user ka password reset karke .env mein lagao (special characters URL-encode karo).");
    return lines;
  }

  const m = uri.match(/^mongodb\+srv:\/\/(?:[^@]+@)?([^/?]+)/);
  if (m) {
    const host = m[1];
    try {
      const recs = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
      lines.push(`DNS SRV theek hai (${recs.length} server mile).`);
      const results = await Promise.all(recs.slice(0, 3).map(async (r) => ({ r, c: await tcpCheck(r.name, r.port) })));
      for (const { r, c } of results) lines.push(`  ${r.name}:${r.port} -> ${c.ok ? "OK" : "FAIL (" + c.why + ")"}`);
      if (results.every((x) => !x.c.ok)) {
        lines.push("-> Port 27017 BLOCK hai (ISP / firewall / antivirus / VPN). Mobile hotspot se try karo, VPN band karo, ya Windows Firewall/antivirus check karo.");
        lines.push("   Agar Atlas cluster PAUSED hai to bhi yehi hota hai: Atlas > Database > Resume.");
      } else {
        lines.push("-> Network theek hai. Cluster paused to nahi? ya TLS/antivirus (SSL scanning) masla ho sakta hai.");
      }
    } catch (e) {
      lines.push(`DNS SRV lookup FAIL (${e.code || e.message}).`);
      lines.push("-> ISP ka DNS SRV block karta hai. .env mein likho:  DNS_SERVERS=8.8.8.8,1.1.1.1  ya Windows DNS 8.8.8.8 kar do,");
      lines.push("   ya Atlas se non-SRV (mongodb://host1,host2,host3) connection string lo.");
    }
  } else {
    lines.push("Standard (non-SRV) URI use ho rahi hai. Host/port aur Atlas ka cluster status (Paused?) check karo.");
  }
  return lines;
}

// Ek dafa connect (reset-admin script bhi isi ko use karta hai)
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI .env mein set nahi hai");

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || "hikmat",
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log(`[MongoDB] connected -> database "${mongoose.connection.name}"`);
}

// Server ke liye: fail ho to wajah batao aur dobara koshish karta rahe (internet/DNS theek hote hi khud connect)
export async function connectWithRetry({ attempts = 6, delayMs = 8000 } = {}) {
  mongoose.connection.on("disconnected", () => console.warn("[MongoDB] disconnected"));
  mongoose.connection.on("reconnected", () => console.log("[MongoDB] reconnected"));

  for (let i = 1; i <= attempts; i++) {
    try {
      await connectDB();
      return true;
    } catch (err) {
      console.error(`\n[MongoDB] CONNECTION FAILED (koshish ${i}/${attempts}): ${err.message.split("\n")[0]}`);
      if (i === 1) for (const l of await diagnoseConnection(err)) console.error("  " + l);
      await mongoose.disconnect().catch(() => {});
      if (i < attempts) {
        console.error(`  ${delayMs / 1000}s baad dobara koshish...\n`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  console.error("\n[MongoDB] Haar maan li. Upar di gayi wajah theek karke server restart karo.\n");
  return false;
}

export { mongoose };
