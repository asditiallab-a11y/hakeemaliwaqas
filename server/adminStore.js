import Admin from "./models/Admin.js";

// auth.js sirf is "store" interface se baat karta hai (database badalna ho to sirf yahan badlo)
const clean = (d) => (d ? { id: String(d._id), username: d.username, passwordHash: d.passwordHash, tokenVersion: d.tokenVersion } : null);

export const adminStore = {
  count: () => Admin.countDocuments(),
  findByUsername: async (u) => clean(await Admin.findOne({ username: String(u).toLowerCase().trim() })),
  findById: async (id) => {
    try {
      return clean(await Admin.findById(id));
    } catch {
      return null;
    }
  },
  create: async ({ username, passwordHash }) => clean(await Admin.create({ username, passwordHash })),
  // patch: { username?, passwordHash?, bumpTokenVersion? }
  update: async (id, { username, passwordHash, bumpTokenVersion }) => {
    const $set = {};
    if (username) $set.username = username;
    if (passwordHash) $set.passwordHash = passwordHash;
    const update = { ...(Object.keys($set).length ? { $set } : {}), ...(bumpTokenVersion ? { $inc: { tokenVersion: 1 } } : {}) };
    return clean(await Admin.findByIdAndUpdate(id, update, { returnDocument: "after" }));
  },
};
