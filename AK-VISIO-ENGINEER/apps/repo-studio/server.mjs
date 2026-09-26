import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const ROOT=path.resolve(import.meta.dirname),PUBLIC=path.join(ROOT,"public"),WORKSPACE=path.join(ROOT,".ak-repo-studio");
const PORT=Number(process.env.PORT||4317),HOST="127.0.0.1",MAX_ZIP=250*1024*1024;
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const safety={production_write:false,destructive_operations:false,external_network_access:false,approval_required_for:["INTEGRATE","DEPLOY","DELETE","PRODUCTION_WRITE"]};
await fsp.mkdir(path.join(WORKSPACE,"imports"),{recursive:true});await fsp.mkdir(path.join(WORKSPACE,"manifests"),{recursive:true});
function send(res,status,data,type="application/json"){res.writeHead(status,{"content-type":type,"cache-control":"no-store"});res.end(type.startsWith("application/json")?JSON.stringify(data,null,2):data)}
function json(res,status,data){send(res,status,data)}
function safeName(v){return String(v||"project").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"project"}
function sha256(file){return new Promise((resolve,reject)=>{const h=crypto.createHash("sha256"),s=fs.createReadStream(file);s.on("error",reject).on("data",d=>h.update(d)).on("end",()=>resolve(h.digest("hex")))})}
async function body(req){let n=0,a=[];for await(const c of req){n+=c.length;if(n>MAX_ZIP)throw Error("Payload too large");a.push(c)}return Buffer.concat(a)}
async function api(req,res,url){
 if(req.method==="GET"&&url.pathname==="/api/health")return json(res,200,{ok:true,service:"AK Repo Studio",version:"0.2.0",host:HOST,port:PORT,safety});
 if(req.method==="GET"&&url.pathname==="/api/manifest")return json(res,200,{manifests:await fsp.readdir(path.join(WORKSPACE,"manifests")).catch(()=>[])});
 if(req.method==="POST"&&url.pathname==="/api/zip"){
  const name=safeName(url.searchParams.get("project")),data=await body(req),filename=name+"-"+Date.now()+".zip",dest=path.join(WORKSPACE,"imports",filename);
  await fsp.writeFile(dest,data);const hash=await sha256(dest);
  const manifest={schema_version:"0.2",project_name:name,created_at:new Date().toISOString(),source:{type:"zip",filename,bytes:data.length,sha256:hash},analysis:{status:"IMPORTED_NOT_EXECUTED",detected_stack:[],note:"ZIP stored locally; execution and dependency installation are disabled."},target:{mode:"IMPORT",project_path:null},safety,next_actions:["Review source","Extract to sandbox","Analyze Project DNA","Run compatibility checks","Generate integration plan","Require approval before integration"]};
  const mf=path.join(WORKSPACE,"manifests",filename.replace(/\.zip$/,".json"));await fsp.writeFile(mf,JSON.stringify(manifest,null,2));return json(res,201,{ok:true,manifest,manifest_file:path.relative(ROOT,mf)})
 }
 return json(res,404,{ok:false,error:"Not found"})
}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,"http://"+HOST+":"+PORT);if(url.pathname.startsWith("/api/"))return await api(req,res,url);const p=url.pathname==="/"?"index.html":url.pathname.replace(/^\//,""),file=path.resolve(PUBLIC,p);if(!file.startsWith(PUBLIC+path.sep))return send(res,403,"Forbidden","text/plain");return send(res,200,await fsp.readFile(file),MIME[path.extname(file)]||"application/octet-stream")}catch(e){return json(res,500,{ok:false,error:e.message})}});
server.listen(PORT,HOST,()=>console.log("AK Repo Studio ready: http://"+HOST+":"+PORT));process.on("SIGINT",()=>server.close(()=>process.exit(0)));