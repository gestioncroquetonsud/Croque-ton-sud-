import {NextResponse} from 'next/server'
export async function POST(req:Request){
  const {token}=await req.json(); const base=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!base||!key)return NextResponse.json({error:'configuration_error'},{status:500})
  const r=await fetch(`${base}/functions/v1/traveler-session`,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':`Bearer ${key}`},body:JSON.stringify({action:'start',token}),cache:'no-store'})
  const data=await r.json(); const out=NextResponse.json(data,{status:r.status})
  if(r.ok&&data.session_id)out.cookies.set('cts_session',data.session_id,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:86400})
  return out
}
