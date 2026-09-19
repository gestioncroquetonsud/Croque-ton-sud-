import {NextRequest,NextResponse} from 'next/server'
export async function GET(req:NextRequest){
  const city_id=req.nextUrl.searchParams.get('city')||''; const language=req.nextUrl.searchParams.get('lang')==='en'?'en':'fr'; const session_id=req.cookies.get('cts_session')?.value||''
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!base||!key||!session_id)return NextResponse.redirect(new URL('/?guide=unavailable',req.url))
  const r=await fetch(`${base}/functions/v1/traveler-session`,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`},body:JSON.stringify({action:'guide',session_id,city_id,language}),cache:'no-store'})
  const data=await r.json(); if(!r.ok||!data.url)return NextResponse.redirect(new URL('/?guide=unavailable',req.url))
  return NextResponse.redirect(data.url)
}
