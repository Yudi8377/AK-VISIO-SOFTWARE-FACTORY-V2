import fs from "node:fs/promises";
import path from "node:path";
const SKIP=new Set([".git","node_modules",".ak-repo-studio","dist","build",".next","coverage"]);
export async function inventory(root){
 const files=[];
 async function walk(dir){
  for(const e of await fs.readdir(dir,{withFileTypes:true})){
   if(SKIP.has(e.name))continue;
   const p=path.join(dir,e.name),rel=path.relative(root,p).replaceAll(path.sep,"/");
   if(e.isDirectory())await walk(p);else{const s=await fs.stat(p);files.push({path:rel,bytes:s.size,ext:path.extname(e.name).toLowerCase()})}
  }
 }
 await walk(root); return files;
}
export function detectStack(files){
 const paths=files.map(x=>x.path.toLowerCase()), all=paths.join("\n"), stack=[];
 if(paths.includes("package.json"))stack.push("Node.js");
 if(all.includes("next.config"))stack.push("Next.js");
 if(all.includes("vite.config"))stack.push("Vite");
 if(all.includes("react"))stack.push("React");
 if(paths.some(x=>x.endsWith("requirements.txt")||x.endsWith("pyproject.toml")))stack.push("Python");
 if(paths.includes("dockerfile"))stack.push("Docker");
 if(all.includes("supabase"))stack.push("Supabase");
 if(paths.some(x=>x.includes("androidmanifest.xml")||x.endsWith("gradlew")))stack.push("Android");
 if(paths.some(x=>x.endsWith(".sln")||x.endsWith(".csproj")))stack.push(".NET");
 if(paths.some(x=>x.endsWith("go.mod")))stack.push("Go");
 return [...new Set(stack)];
}
export function classify(files){
 const p=files.map(x=>x.path.toLowerCase());
 return {
  source_files:files.length,
  has_package_json:p.includes("package.json"),
  has_readme:p.some(x=>x==="readme.md"||x.endsWith("/readme.md")),
  has_env_example:p.some(x=>x.endsWith(".env.example")||x.endsWith(".env.sample")),
  has_docker:p.includes("dockerfile"),
  has_tests:p.some(x=>/(^|\/)(test|tests|__tests__|spec|e2e)(\/|$)/.test(x)||/\.(test|spec)\./.test(x)),
  has_ci:p.some(x=>x.startsWith(".github/workflows/")||x.includes("/.github/workflows/")),
  likely_secret_files:p.filter(x=>/(^|\/)(\.env|\.npmrc|\.pypirc|credentials|secrets?)(\.|$)/.test(x)).slice(0,20)
 };
}
export function buildPlan({projectName,targetMode,sourceStack,classification}){
 const risks=[];
 if(classification.likely_secret_files.length)risks.push("Potential secret-bearing files detected; inspect before integration.");
 if(!classification.has_tests)risks.push("No obvious test directory detected.");
 if(!classification.has_readme)risks.push("README not detected; project intent may need manual confirmation.");
 const actions=[
  "Create isolated sandbox copy",
  "Generate Project DNA",
  "Compare runtime and framework compatibility",
  "Inspect dependency and configuration boundaries",
  "Generate proposed file/module integration map",
  "Create backup/rollback point",
  "Require human approval",
  "Execute only approved changes",
  "Run regression and smoke tests",
  "Produce evidence report"
 ];
 return {plan_version:"0.3",project_name:projectName,target_mode:targetMode,source_stack:sourceStack,risks,actions,approval_required:true,production_write:false,destructive_operations:false};
}