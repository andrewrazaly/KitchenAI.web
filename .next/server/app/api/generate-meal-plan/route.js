"use strict";(()=>{var e={};e.id=4023,e.ids=[4023],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},14300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},87561:e=>{e.exports=require("node:fs")},84492:e=>{e.exports=require("node:stream")},72477:e=>{e.exports=require("node:stream/web")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},71267:e=>{e.exports=require("worker_threads")},59796:e=>{e.exports=require("zlib")},60206:(e,t,r)=>{let i;r.r(t),r.d(t,{headerHooks:()=>f,originalPathname:()=>b,patchFetch:()=>w,requestAsyncStorage:()=>m,routeModule:()=>d,serverHooks:()=>g,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>y});var a={};r.r(a),r.d(a,{POST:()=>c});var n=r(95419),o=r(69108),s=r(99678),l=r(98984),p=r(18142);async function c(e){try{{let t=await (0,p.q)(e);if(t)return t}let{budget:t,preferences:r,restrictions:a,days:n,expiringItems:o=[],inventoryItems:s=[]}=await e.json();if(i)try{let e,p;let c=(p=`Please create a meal plan for ${n} days.

`,a&&a.length>0&&(p+=`Dietary restrictions: ${a.join(", ")}.

`),r&&r.length>0&&(p+=`Food preferences: ${r.join(", ")}.

`),t&&(p+=`The total budget for this meal plan is $${t}. Please optimize the recipes to stay within this budget.

`),s&&s.length>0&&(p+=`I already have these ingredients in my inventory, please prioritize using them: ${s.join(", ")}.

`),o&&o.length>0&&(p+=`These items in my inventory are expiring soon, so prioritize using them first: ${o.join(", ")}.

`),p+=`Please provide a meal plan in the following JSON format exactly:

{
  "meals": [
    {
      "date": "YYYY-MM-DD", 
      "breakfast": {
        "title": "Breakfast Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 15,
        "difficulty": "easy",
        "nutrition": {
          "calories": 350,
          "protein": 20,
          "carbs": 30,
          "fat": 15
        }
      },
      "lunch": {
        "title": "Lunch Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 25,
        "difficulty": "medium",
        "nutrition": {
          "calories": 450,
          "protein": 25,
          "carbs": 40,
          "fat": 18
        }
      },
      "dinner": {
        "title": "Dinner Title",
        "ingredients": ["ingredient 1", "ingredient 2", "..."],
        "prepTime": 35,
        "difficulty": "medium",
        "nutrition": {
          "calories": 550,
          "protein": 30,
          "carbs": 45,
          "fat": 22
        }
      }
    },
    ...more days...
  ]
}

Do not include any explanatory text, only return the exact JSON structure above.
Use simple and clear recipe names.
List ingredients in a simple, grocery-list friendly format.
Generate exactly ${n} days worth of meals starting from today.
Include realistic prep times in minutes.
Set difficulty as "easy", "medium", or "hard".
Provide accurate nutrition estimates for each meal.`),u=(await i.chat.completions.create({model:"gpt-4",messages:[{role:"system",content:"You are a professional nutritionist and chef who specializes in creating personalized meal plans. Your response should be in the exact JSON format requested in the user prompt, without any additional text or explanation."},{role:"user",content:c}],temperature:.7,max_tokens:3e3,response_format:{type:"json_object"}})).choices[0].message.content||"";try{e=JSON.parse(u)}catch(e){return console.error("Error parsing OpenAI response as JSON:",e),l.NextResponse.json({success:!1,message:"Failed to parse meal plan response"},{status:500})}return l.NextResponse.json({success:!0,mealPlan:e.meals})}catch(t){console.error("Error with OpenAI API:",t),console.log("Falling back to mock meal plan data due to OpenAI error");let e=u(n,o,s);return l.NextResponse.json({success:!0,mealPlan:e})}else{console.log("Using mock meal plan data - no valid OpenAI API key found");let e=u(n,o,s);return l.NextResponse.json({success:!0,mealPlan:e})}}catch(e){return console.error("Error generating meal plan:",e),l.NextResponse.json({success:!1,message:"Failed to generate meal plan. Please try again."},{status:500})}}function u(e,t=[],r=[]){let i=[],a=new Date,n=[{title:"Avocado Toast with Eggs",ingredients:["whole grain bread","avocado","eggs","salt","pepper","red pepper flakes"],prepTime:10,difficulty:"easy",nutrition:{calories:320,protein:18,carbs:25,fat:18}},{title:"Greek Yogurt with Berries",ingredients:["greek yogurt","mixed berries","honey","granola","chia seeds"],prepTime:5,difficulty:"easy",nutrition:{calories:280,protein:20,carbs:35,fat:8}},{title:"Veggie Omelette",ingredients:["eggs","bell pepper","spinach","mushrooms","cheese","salt","pepper"],prepTime:15,difficulty:"medium",nutrition:{calories:350,protein:25,carbs:8,fat:24}},{title:"Overnight Oats",ingredients:["rolled oats","milk","honey","banana","peanut butter","cinnamon"],prepTime:5,difficulty:"easy",nutrition:{calories:380,protein:15,carbs:55,fat:12}}],o=[{title:"Chicken Salad Wrap",ingredients:["chicken breast","tortilla wrap","lettuce","tomato","cucumber","mayo","mustard"],prepTime:15,difficulty:"easy",nutrition:{calories:420,protein:30,carbs:35,fat:18}},{title:"Quinoa Bowl with Roasted Vegetables",ingredients:["quinoa","bell peppers","zucchini","red onion","olive oil","lemon juice","feta cheese"],prepTime:30,difficulty:"medium",nutrition:{calories:380,protein:15,carbs:50,fat:14}},{title:"Tuna Sandwich",ingredients:["tuna","whole grain bread","lettuce","tomato","mayo","celery"],prepTime:10,difficulty:"easy",nutrition:{calories:350,protein:25,carbs:30,fat:15}},{title:"Lentil Soup",ingredients:["lentils","carrot","celery","onion","vegetable broth","cumin","garlic"],prepTime:45,difficulty:"medium",nutrition:{calories:320,protein:18,carbs:45,fat:6}}],s=[{title:"Spaghetti with Marinara",ingredients:["spaghetti","tomato sauce","garlic","onion","olive oil","parmesan cheese","basil"],prepTime:25,difficulty:"easy",nutrition:{calories:480,protein:18,carbs:70,fat:15}},{title:"Grilled Salmon with Veggies",ingredients:["salmon fillet","asparagus","lemon","olive oil","garlic","salt","pepper"],prepTime:20,difficulty:"medium",nutrition:{calories:420,protein:35,carbs:12,fat:25}},{title:"Chicken Stir Fry",ingredients:["chicken breast","bell peppers","broccoli","carrots","soy sauce","ginger","garlic"],prepTime:20,difficulty:"medium",nutrition:{calories:380,protein:32,carbs:25,fat:16}},{title:"Black Bean Tacos",ingredients:["black beans","corn tortillas","avocado","salsa","cheese","lime","cilantro"],prepTime:15,difficulty:"easy",nutrition:{calories:450,protein:20,carbs:55,fat:18}}],l=e=>{if(0===t.length)return e[Math.floor(Math.random()*e.length)];let r=e.filter(e=>e.ingredients.some(e=>t.some(t=>e.toLowerCase().includes(t.toLowerCase()))));return r.length>0?r[Math.floor(Math.random()*r.length)]:e[Math.floor(Math.random()*e.length)]};for(let t=0;t<e;t++){let e=new Date(a);e.setDate(e.getDate()+t),i.push({date:e.toISOString().split("T")[0],breakfast:l(n),lunch:l(o),dinner:l(s)})}return i}r.e(6663).then(r.bind(r,86663)).then(e=>{i=new e.default({apiKey:"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"})});let d=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/generate-meal-plan/route",pathname:"/api/generate-meal-plan",filename:"route",bundlePath:"app/api/generate-meal-plan/route"},resolvedPagePath:"/Users/andrewthorpe/Documents/Documents/Upstart Studio/Start Ups/KitchenAI mockup apps/KitchenAI_v1mock copy/app/api/generate-meal-plan/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:m,staticGenerationAsyncStorage:h,serverHooks:g,headerHooks:f,staticGenerationBailout:y}=d,b="/api/generate-meal-plan/route";function w(){return(0,s.patchFetch)({serverHooks:g,staticGenerationAsyncStorage:h})}},18142:(e,t,r)=>{r.d(t,{q:()=>p});var i=r(98984),a=r(86323);let n="https://wofujmjtywidyilhfewn.supabase.co",o="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZnVqbWp0eXdpZHlpbGhmZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNTkwNDEsImV4cCI6MjA2MjkzNTA0MX0.RO5x9h_QEzNFbyiMqphMuqYDChd-KQ9Cf3ODvP_RzO4";n&&o||console.warn("Missing Supabase environment variables. Rate limiting may not work correctly.");let s=(0,a.eI)(n||"https://placeholder-project.supabase.co",o||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder"),l={limit:50,window:86400};async function p(e,t=l){try{let r;let a=!1;try{let{data:{session:t},error:i}=await s.auth.getSession();if(!i&&t)r=t.user.id,a=!0;else{let t=e.headers.get("x-forwarded-for"),i=t?t.split(",")[0]:e.headers.get("x-real-ip")||"unknown";r=`ip_${i}`,a=!1}}catch(n){let t=e.headers.get("x-forwarded-for"),i=t?t.split(",")[0]:e.headers.get("x-real-ip")||"unknown";r=`ip_${i}`,a=!1}let n=Math.floor(Date.now()/1e3),o=a?t:{...t,limit:10};try{let{data:e,error:t}=await s.from("user_rate_limits").select("count, reset_at").eq("user_id",r).single();if(t&&"PGRST116"!==t.code)return console.error("Database error:",t),null;if(!e||n>e.reset_at){let{error:e}=await s.from("user_rate_limits").upsert({user_id:r,count:1,reset_at:n+o.window});return e&&console.error("Error updating rate limit:",e),null}if(e.count>=o.limit){let t=e.reset_at-n;return i.NextResponse.json({success:!1,message:`Rate limit exceeded. You've used all ${o.limit} AI requests for today. Limit resets in ${Math.ceil(t/3600)} hours.`},{status:429})}let{error:a}=await s.from("user_rate_limits").update({count:e.count+1}).eq("user_id",r);return a&&console.error("Error updating rate limit count:",a),null}catch(e){return console.error("Database operation failed, allowing request:",e),null}}catch(e){return console.error("Rate limiter error:",e),null}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[1638,2791,3122,6323],()=>r(60206));module.exports=i})();