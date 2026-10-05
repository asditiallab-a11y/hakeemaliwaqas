import express from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import { pruneMedia } from "../media.js";

const validId = (id) => mongoose.isValidObjectId(id);
const CI = { locale: "en", strength: 2 }; // case-insensitive compare

const outItem = (d) => {
  const { _id, __v, createdAt, updatedAt, sortOrder, category, ...rest } = d.toObject();
  const out = { id: String(_id), ...rest };
  // purane records mein sirf `category` (ek) hoti thi; naye mein `categories` (kai). Dono ko `categories` bana kar bhejte hain.
  if ("categories" in rest || category !== undefined) out.categories = rest.categories?.length ? rest.categories : category ? [category] : [];
  else out.category = category;
  return out;
};
// record ki saari uploaded files ke URL (image, brochure, gallery...)
const mediaOf = (doc, mediaFields) => mediaFields.flatMap((f) => [].concat(doc?.[f] ?? [])).filter(Boolean);
const outCat = (c) => ({ id: String(c._id), name: c.name });

// Admin ke list pages (treatments, medicines...) ke liye reusable CRUD router.
//   Item: mongoose model, fields: jo fields client se save ho sakti hain, categoryType: categories chahiye to
//   multiCat: item ki kai categories (`categories` array). clean(data, ctx): data ko check/saaf karta hai (galat ho to HttpError).
//   mediaFields: jin fields mein uploaded files ke URL hain, taake purani/hataai gayi files disk se saaf ho jayen.
export function crudRouter({ Item, fields, categoryType, multiCat = false, clean, mediaFields = [] }) {
  const r = express.Router();
  const wrap = (fn) => (req, res, next) =>
    fn(req, res).catch((err) =>
      err.expose ? res.status(err.status || 400).json({ error: err.message })
        : err.name === "ValidationError" || err.name === "CastError" ? res.status(400).json({ error: "Invalid data" }) : next(err)
    );
  const pick = (body) => Object.fromEntries(fields.filter((f) => body?.[f] !== undefined).map((f) => [f, body[f]]));
  const catNames = async () => (await Category.find({ type: categoryType }).select("name")).map((c) => c.name);
  const build = async (body, create) => {
    const data = pick(body);
    return clean ? clean(data, { create, catNames }) : data;
  };
  const nextOrder = async (M, filter = {}) => ((await M.findOne(filter).sort({ sortOrder: -1 }).select("sortOrder"))?.sortOrder ?? -1) + 1;

  // ---- list (items + categories ek saath) ----
  r.get("/", wrap(async (_req, res) => {
    const [items, cats] = await Promise.all([
      Item.find().sort({ sortOrder: 1, createdAt: 1 }),
      categoryType ? Category.find({ type: categoryType }).sort({ sortOrder: 1, createdAt: 1 }) : [],
    ]);
    res.json({ items: items.map(outItem), categories: cats.map(outCat) });
  }));

  // ---- items ----
  r.post("/", wrap(async (req, res) => {
    const doc = await Item.create({ ...(await build(req.body, true)), sortOrder: await nextOrder(Item) });
    res.status(201).json(outItem(doc));
  }));

  r.post("/bulk-delete", wrap(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 500) : [];
    if (!ids.length) return res.status(400).json({ error: "Invalid request" });
    const old = mediaFields.length ? await Item.find({ _id: { $in: ids } }).select(mediaFields.join(" ")) : [];
    await Item.deleteMany({ _id: { $in: ids } });
    res.json({ ok: true });
    pruneMedia(old.flatMap((d) => mediaOf(d, mediaFields)));
  }));

  r.put("/order", wrap(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(validId).slice(0, 2000) : [];
    if (ids.length) await Item.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: i } } } })));
    res.json({ ok: true });
  }));

  r.put("/:id", wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const data = await build(req.body, false);
    const old = mediaFields.length ? await Item.findById(req.params.id).select(mediaFields.join(" ")) : null;
    const update = { $set: data };
    if (multiCat && "categories" in data) update.$unset = { category: "" }; // purani single `category` ab categories mein chali gayi
    const doc = await Item.findByIdAndUpdate(req.params.id, update, { returnDocument: "after", runValidators: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(outItem(doc));
    if (old) { const now = new Set(mediaOf(doc, mediaFields)); pruneMedia(mediaOf(old, mediaFields).filter((u) => !now.has(u))); }
  }));

  r.delete("/:id", wrap(async (req, res) => {
    if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
    const doc = await Item.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
    if (doc) pruneMedia(mediaOf(doc, mediaFields));
  }));

  // ---- categories ----
  if (categoryType) {
    const cleanName = (v) => String(v ?? "").trim().slice(0, 80);

    r.post("/categories", wrap(async (req, res) => {
      const name = cleanName(req.body?.name);
      if (!name) return res.status(400).json({ error: "Category name required" });
      if (await Category.findOne({ type: categoryType, name }).collation(CI)) return res.status(409).json({ error: "Category already exists" });
      const c = await Category.create({ type: categoryType, name, sortOrder: await nextOrder(Category, { type: categoryType }) });
      res.status(201).json(outCat(c));
    }));

    r.put("/categories/:id", wrap(async (req, res) => {
      const name = cleanName(req.body?.name);
      if (!name || !validId(req.params.id)) return res.status(400).json({ error: "Invalid request" });
      const old = await Category.findOne({ _id: req.params.id, type: categoryType });
      if (!old) return res.status(404).json({ error: "Not found" });
      const dup = await Category.findOne({ type: categoryType, name, _id: { $ne: old._id } }).collation(CI);
      if (dup) return res.status(409).json({ error: "Category already exists" });
      const oldName = old.name;
      old.name = name;
      await old.save();
      // items ki category bhi badal do
      if (multiCat) {
        await Item.updateMany({ categories: oldName }, { $set: { "categories.$[el]": name } }, { arrayFilters: [{ el: oldName }] });
        await Item.updateMany({ category: oldName }, { $set: { category: name } }); // purane (single category wale) records
      } else {
        await Item.updateMany({ category: oldName }, { $set: { category: name } });
      }
      res.json(outCat(old));
    }));

    r.delete("/categories/:id", wrap(async (req, res) => {
      if (!validId(req.params.id)) return res.status(404).json({ error: "Not found" });
      const c = await Category.findOneAndDelete({ _id: req.params.id, type: categoryType });
      if (c && multiCat) {
        // jis category ko hataya wo items se bhi nikal do (item "All" mein aa jata hai)
        await Item.updateMany({ categories: c.name }, { $pull: { categories: c.name } });
        await Item.updateMany({ category: c.name }, { $unset: { category: "" } });
      }
      res.json({ ok: true });
    }));
  }

  return r;
}
