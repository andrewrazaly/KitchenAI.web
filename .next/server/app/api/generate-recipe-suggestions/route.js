"use strict";(()=>{var e={};e.id=3670,e.ids=[3670],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},71267:e=>{e.exports=require("worker_threads")},59796:e=>{e.exports=require("zlib")},99828:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>f,originalPathname:()=>w,patchFetch:()=>y,requestAsyncStorage:()=>g,routeModule:()=>d,serverHooks:()=>h,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>x});var i={};t.r(i),t.d(i,{POST:()=>l});var s=t(95419),n=t(69108),o=t(99678),a=t(98984),p=t(86663),u=t(18142);let c=new p.default({apiKey:"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"});async function l(e){try{var r,t;let i;let s=await (0,u.q)(e);if(s)return s;let{ingredients:n,expiringItems:o,dietary_restrictions:p}=await e.json();if(!n||!Array.isArray(n))return a.NextResponse.json({success:!1,message:"Ingredients array is required"},{status:400});let l=(r=o||[],t=p||[],`
Generate 3 recipe suggestions based on the following available ingredients, with special focus on using ingredients that will expire soon.

Available Ingredients:
${n.map(e=>`- ${e}`).join("\n")}

Ingredients Expiring Soon (prioritize using these):
${r.length>0?r.map(e=>`- ${e}`).join("\n"):"None"}

Dietary Restrictions:
${t.length>0?t.map(e=>`- ${e}`).join("\n"):"None"}

For each recipe, provide the following in JSON format:
1. title: The name of the recipe
2. mealType: Either "breakfast", "lunch", or "dinner"
3. ingredients: A list of required ingredients with approximate measurements
4. instructions: Step-by-step cooking instructions
5. prepTime: Estimated preparation time in minutes
6. cookTime: Estimated cooking time in minutes
7. usedExpiringItems: List of expiring ingredients used in this recipe

Return the suggestions in the following JSON format:
{
  "recipes": [
    {
      "title": "Recipe Title",
      "mealType": "breakfast|lunch|dinner",
      "ingredients": ["1 cup ingredient 1", "2 tablespoons ingredient 2", ...],
      "instructions": "Step-by-step instructions...",
      "prepTime": 15,
      "cookTime": 30,
      "usedExpiringItems": ["ingredient 1", "ingredient 2"]
    },
    ...
  ]
}

The recipes should be practical, everyday dishes that most people could prepare without specialized equipment or hard-to-find ingredients. Prioritize recipes that use more of the expiring ingredients.
`),d=(await c.chat.completions.create({model:"gpt-3.5-turbo",messages:[{role:"system",content:"You are a culinary AI assistant who specializes in recommending recipes based on available ingredients. Focus on practical, everyday recipes that are easy to prepare."},{role:"user",content:l}],temperature:.7,max_tokens:1e3,response_format:{type:"json_object"}})).choices[0].message.content;try{i=JSON.parse(d||'{"recipes":[]}')}catch(e){console.error("Error parsing OpenAI response:",e),i={recipes:[]}}return a.NextResponse.json({success:!0,suggestions:i.recipes})}catch(e){return console.error("Error generating recipe suggestions:",e),a.NextResponse.json({success:!1,message:"Failed to generate recipe suggestions"},{status:500})}}let d=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/generate-recipe-suggestions/route",pathname:"/api/generate-recipe-suggestions",filename:"route",bundlePath:"app/api/generate-recipe-suggestions/route"},resolvedPagePath:"/Users/andrewthorpe/Documents/Documents/Upstart Studio/Start Ups/KitchenAI mockup apps/KitchenAI_v1mock copy/app/api/generate-recipe-suggestions/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:m,serverHooks:h,headerHooks:f,staticGenerationBailout:x}=d,w="/api/generate-recipe-suggestions/route";function y(){return(0,o.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:m})}},18142:(e,r,t)=>{t.d(r,{q:()=>u});var i=t(98984),s=t(86323);let n="https://wofujmjtywidyilhfewn.supabase.co",o="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZnVqbWp0eXdpZHlpbGhmZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTkwNDEsImV4cCI6MjA2MjkzNTA0MX0.RO5x9h_QEzNFbyiMqphMuqYDChd-KQ9Cf3ODvP_RzO4";n&&o||console.warn("Missing Supabase environment variables. Rate limiting may not work correctly.");let a=(0,s.eI)(n||"https://placeholder-project.supabase.co",o||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder"),p={limit:50,window:86400};async function u(e,r=p){try{let t;let s=!1;try{let{data:{session:r},error:i}=await a.auth.getSession();if(!i&&r)t=r.user.id,s=!0;else{let r=e.headers.get("x-forwarded-for"),i=r?r.split(",")[0]:e.headers.get("x-real-ip")||"unknown";t=`ip_${i}`,s=!1}}catch(n){let r=e.headers.get("x-forwarded-for"),i=r?r.split(",")[0]:e.headers.get("x-real-ip")||"unknown";t=`ip_${i}`,s=!1}let n=Math.floor(Date.now()/1e3),o=s?r:{...r,limit:10};try{let{data:e,error:r}=await a.from("user_rate_limits").select("count, reset_at").eq("user_id",t).single();if(r&&"PGRST116"!==r.code)return console.error("Database error:",r),null;if(!e||n>e.reset_at){let{error:e}=await a.from("user_rate_limits").upsert({user_id:t,count:1,reset_at:n+o.window});return e&&console.error("Error updating rate limit:",e),null}if(e.count>=o.limit){let r=e.reset_at-n;return i.NextResponse.json({success:!1,message:`Rate limit exceeded. You've used all ${o.limit} AI requests for today. Limit resets in ${Math.ceil(r/3600)} hours.`},{status:429})}let{error:s}=await a.from("user_rate_limits").update({count:e.count+1}).eq("user_id",t);return s&&console.error("Error updating rate limit count:",s),null}catch(e){return console.error("Database operation failed, allowing request:",e),null}}catch(e){return console.error("Rate limiter error:",e),null}}}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),i=r.X(0,[1638,2791,3122,6323,6663],()=>t(99828));module.exports=i})();