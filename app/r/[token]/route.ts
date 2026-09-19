import {NextRequest,NextResponse} from 'next/server'
export async function GET(req:NextRequest,{params}:{params:Promise<{token:string}>}){
  const {token}=await params; const session_id=req.cookies.get('cts_session')?.value||''; const base=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!base||!key)return NextResponse.redirect(new URL('/',req.url))
  const r=await fetch(`${base}/functions/v1/traveler-session`,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`},body:JSON.stringify({action:'external',session_id,tracking_token:token}),cache:'no-store'})
  const data=await r.json(); if(!r.ok||!data.url)return NextResponse.redirect(new URL('/',req.url)); return NextResponse.redirect(data.url)
}
