import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {inventory,detectStack,classify,buildPlan} from "./analyzer.mjs";
import {extractZip,sha256} from "./sandbox.mjs";
import {buildProjectDNA} from "./project-dna.mjs";
import {compatibility} from "./compatibility.mjs";
const ROOT=path.resolve(import.meta.dirname),PUBLIC=path.join(ROOT,"public"),WORKSPACE=path.join(ROOT,".ak-repo-studio");
const PORT=Number(process.env.PORT||4317),HOST="127.0.0.1",MAX_ZIP=250*1024*1024;
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const safety={production_write:false,destructive_operations:false,external_network_access:false,dependency_install:false,approval_required_for:["INTEGRATE","DEPLOY","DELETE","PRODUCTION_WRITE"]};
await Promise.all([fsp.mkdir(path.join(WORKSPACE,"imports"),{recursive:true}),fsp.mkdir(path.join(WORKSPACE,"sandboxes"),{recursive:true}),fsp.mkdir(path.join(WORKSPACE,"manifests"),{recursive:true})]);
function send(res,status,data,type="application/json"){res.writeHead(status,{"content-type":type,"cache-control":"no-store"});res.end(type.startsWith("application/json")?JSON.stringify(data,null,2):data)}
function json(res,status,data){send(res,status,data)}
function safeName(v){return String(v||"project").replace(/[^a-zA-Z0-9._-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"project"}
async function body(req){let n=0,a=[];for await(const c of req){n+=c.length;if(n>MAX_ZIP)throw Error("Payload too large");a.push(c)}return Buffer.concat(a)}
function sandboxPath(p){const root=path.join(WORKSPACE,"sandboxes")+path.sep;const abs=path.resolve(p);if(!abs.startsWith(root))throw Error("Operation is restricted to the Repo Studio sandbox.");return abs}
async function latestImport(project){const dir=path.join(WORKSPACE,"imports"),items=await fsp.readdir(dir);const matches=items.filter(x=>x.startsWith(safeName(project)+"-")&&x.endsWith(".zip")).sort();if(!matches.length)throw Error("No imported ZIP found for project.");return path.join(dir,matches.at(-1))}
async function api(req,res,url){
 if(req.method==="GET"&&url.pathname==="/api/health")return json(res,200,{ok:true,service:"AK Repo Studio",version:"0.4.0",host:HOST,port:PORT,safety});
 if(req.method==="GET"&&url.pathname==="/api/manifest")return json(res,200,{manifests:await fsp.readdir(path.join(WORKSPACE,"manifests")).catch(()=>[])});
 if(req.method==="POST"&&url.pathname==="/api/zip"){
  const name=safeName(url.searchParams.get("project")),mode=url.searchParams.get("mode")||"IMPORT",data=await body(req),filename=name+"-"+Date.now()+".zip",dest=path.join(WORKSPACE,"imports",filename);
  if(!data.length||data.length>MAX_ZIP)throw Error("Invalid ZIP payload.");
  await fsp.writeFile(dest,data);const hash=await sha256(dest);
  const manifest={schema_version:"0.4",project_name:name,created_at:new Date().toISOString(),source:{type:"zip",filename,bytes:data.length,sha256:hash},analysis:{status:"IMPORTED_NOT_EXECUTED"},target:{mode,project_path:null},safety,next_actions:["Extract to isolated sandbox","Generate Project DNA","Run compatibility checks","Generate integration plan","Require approval before integration"]};
  const mf=path.join(WORKSPACE,"manifests",filename.replace(/\.zip$/,".json"));await fsp.writeFile(mf,JSON.stringify(manifest,null,2));return json(res,201,{ok:true,manifest,manifest_file:path.relative(ROOT,mf)});
 }
 if(req.method==="POST"&&url.pathname==="/api/extract"){
  const name=safeName(url.searchParams.get("project")),mode=url.searchParams.get("mode")||"IMPORT",zip=await latestImport(name),sourceHash=await sha256(zip),id=Date.now().toString(),dest=path.join(WORKSPACE,"sandboxes",name,id);
  await fsp.mkdir(dest,{recursive:true});const extraction=await extractZip(zip,dest);const dna=await buildProjectDNA(dest,{project_name:name,source_sha256:sourceHash});
  const plan=buildPlan({projectName:name,targetMode:mode,sourceStack:dna.stack,classification:{...await classify(await inventory(dest)),likely_secret_files:dna.possible_secrets}});
  const result={schema_version:"0.4",project_name:name,sandbox:{path:path.relative(ROOT,dest),extraction},project_dna:dna,integration_plan:plan,safety};
  const out=path.join(WORKSPACE,"manifests",name+"-"+id+"-dna.json");await fsp.writeFile(out,JSON.stringify(result,null,2));return json(res,201,{ok:true,result,report_file:path.relative(ROOT,out)});
 }
 if(req.method==="POST"&&url.pathname==="/api/compatibility"){
  const source=sandboxPath(url.searchParams.get("source")||""),target=sandboxPath(url.searchParams.get("target")||"");
  const sourceDNA=await buildProjectDNA(source,{project_name:path.basename(source),source_sha256:"sandbox"}),targetDNA=await buildProjectDNA(target,{project_name:path.basename(target),source_sha256:"sandbox"});
  const result={schema_version:"0.4",source:sourceDNA.identity,target:targetDNA.identity,compatibility:compatibility(sourceDNA,targetDNA),safety};
  const out=path.join(WORKSPACE,"manifests","compatibility-"+Date.now()+".json");await fsp.writeFile(out,JSON.stringify(result,null,2));return json(res,200,{ok:true,result,report_file:path.relative(ROOT,out)});
 }
 if(req.method==="POST"&&url.pathname==="/api/analyze"){
  const root=sandboxPath(url.searchParams.get("path")||""),files=await inventory(root),stack=detectStack(files),classification=classify(files),name=safeName(url.searchParams.get("project"));
  const plan=buildPlan({projectName:name,targetMode:url.searchParams.get("mode")||"IMPORT",sourceStack:stack,classification});
  const result={schema_version:"0.4",project_name:name,analysis:{status:"SANDBOX_ANALYZED",detected_stack:stack,classification,file_count:files.length,files:files.slice(0,500)},integration_plan:plan,safety};
  const out=path.join(WORKSPACE,"manifests",name+"-analysis.json");await fsp.writeFile(out,JSON.stringify(result,null,2));return json(res,200,{ok:true,result,report_file:path.relative(ROOT,out)});
 }
 return json(res,404,{ok:false,error:"Not found"});
}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,"http://"+HOST+":"+PORT);if(url.pathname.startsWith("/api/"))return await api(req,res,url);const requested=url.pathname==="/"?"index.html":url.pathname.replace(/^\//,""),file=path.resolve(PUBLIC,requested);if(!file.startsWith(PUBLIC+path.sep))return send(res,403,"Forbidden","text/plain");return send(res,200,await fsp.readFile(file),MIME[path.extname(file)]||"application/octet-stream")}catch(e){return json(res,400,{ok:false,error:e.message})}});
server.listen(PORT,HOST,()=>console.log("AK Repo Studio ready: http://"+HOST+":"+PORT));process.on("SIGINT",()=>server.close(()=>process.exit(0)));