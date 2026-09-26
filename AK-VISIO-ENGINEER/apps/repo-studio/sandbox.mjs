import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const MAX_ENTRIES=10000,MAX_TOTAL=500*1024*1024,MAX_FILE=100*1024*1024;
const BAD_PREFIXES=["/","\\"]; const DANGEROUS=new Set([".git","node_modules"]);
export function normalizeZipEntry(name){
  const raw=String(name||"").replaceAll("\\\\","/");
  if(!raw||raw.endsWith("/"))return null;
  if(raw.includes("\0")||BAD_PREFIXES.some(x=>raw.startsWith(x))||/^[A-Za-z]:\//.test(raw))throw Error("Unsafe ZIP entry path: "+name);
  const parts=raw.split("/");
  if(parts.some(p=>p===".."||p==="."))throw Error("Unsafe ZIP traversal entry: "+name);
  return parts.filter(Boolean).join("/");
}
export function validateEntries(entries){
  if(entries.length>MAX_ENTRIES)throw Error("ZIP contains too many entries.");
  let total=0;
  return entries.map(e=>{const rel=normalizeZipEntry(e.path||e.name); if(!rel)return null; const size=Number(e.size||0); if(size>MAX_FILE)throw Error("ZIP file exceeds per-file limit: "+rel); total+=size; if(total>MAX_TOTAL)throw Error("ZIP exceeds total extracted-size limit."); return {path:rel,size};}).filter(Boolean);
}
export async function extractZip(zipPath,dest){
  const yauzl=require("yauzl");
  await fs.mkdir(dest,{recursive:true});
  const entries=[];
  await new Promise((resolve,reject)=>{
    yauzl.open(zipPath,{lazyEntries:true},(err,zip)=>{
      if(err)return reject(err);
      zip.readEntry();
      zip.on("entry",e=>{entries.push(e);zip.readEntry()});
      zip.on("end",resolve); zip.on("error",reject);
    });
  });
  const safe=validateEntries(entries);
  let i=0;
  await new Promise((resolve,reject)=>{
    yauzl.open(zipPath,{lazyEntries:true},(err,zip)=>{
      if(err)return reject(err);
      const next=()=>zip.readEntry();
      zip.on("entry",e=>{
        const rel=normalizeZipEntry(e.fileName);
        if(!rel)return next();
        zip.openReadStream(e,(er,stream)=>{
          if(er)return reject(er);
          const out=path.join(dest,rel);
          if(!out.startsWith(path.resolve(dest)+path.sep))return reject(Error("Extraction path escaped sandbox."));
          fs.mkdir(path.dirname(out),{recursive:true}).then(()=>new Promise((res,rej)=>{
            const ws=require("node:fs").createWriteStream(out,{flags:"wx"});
            stream.pipe(ws); ws.on("finish",res); ws.on("error",rej); stream.on("error",rej);
          })).then(()=>{i++;next()}).catch(reject);
        });
      });
      zip.on("end",resolve); zip.on("error",reject);
    });
  });
  return {entries:safe.length,files_written:i,limits:{max_entries:MAX_ENTRIES,max_total_bytes:MAX_TOTAL,max_file_bytes:MAX_FILE}};
}
export async function sha256(file){const h=crypto.createHash("sha256");const b=await fs.readFile(file);return h.update(b).digest("hex")}
