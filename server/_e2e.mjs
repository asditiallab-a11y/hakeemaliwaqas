import express from "express";
import { createAuth, ensureAdmin } from "./auth.js";
const users=[];let id=1;
const store={count:async()=>users.length,findByUsername:async u=>users.find(x=>x.username===u)||null,findById:async i=>users.find(x=>x.id===String(i))||null,
 create:async({username,passwordHash})=>{const u={id:String(id++),username,passwordHash,tokenVersion:0};users.push(u);return u},
 update:async(i,{username,passwordHash,bumpTokenVersion})=>{const u=users.find(x=>x.id===i);if(username)u.username=username;if(passwordHash)u.passwordHash=passwordHash;if(bumpTokenVersion)u.tokenVersion++;return u}};
await ensureAdmin(store,{username:"admin",password:"Secret#1234"});
const app=express();app.use(express.json());app.use("/api/auth",createAuth(store,{jwtSecret:"b".repeat(40)}).router);app.listen(5000);
