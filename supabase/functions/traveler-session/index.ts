import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})

async function allowedCities(propertyId:string, fallbackCityId:string){
  const {data:pc}=await sb.from('property_cities').select('city_id,sort_order,cities(id,name,slug,active,cover_image_url)').eq('property_id',propertyId).eq('active',true).order('sort_order')
  const mapped=(pc||[]).map((r:any)=>r.cities).filter((c:any)=>c?.active)
  if(mapped.length) return mapped
  const {data:c}=await sb.from('cities').select('id,name,slug,active,cover_image_url').eq('id',fallbackCityId).eq('active',true).maybeSingle()
  return c?[c]:[]
}

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return json({error:'method_not_allowed'},405)
  try{
    const body=await req.json(); const action=body.action
    if(action==='start'){
      const token=String(body.token||'').trim(); if(token.length<20) return json({error:'invalid_qr'},400)
      const {data:q}=await sb.from('qr_codes').select('id,property_id,status,monthly_threshold,warning_percent,properties(id,label,city_id,client_id,status)').eq('token',token).maybeSingle()
      if(!q) return json({error:'qr_not_found'},404)
      if(q.status!=='active'||(q as any).properties?.status!=='active') return json({error:'qr_blocked'},403)
      const p:any=(q as any).properties; const cities=await allowedCities(p.id,p.city_id)
      if(!cities.length) return json({error:'city_unavailable'},404)
      const sessionId=crypto.randomUUID()
      await sb.from('traveler_sessions').insert({id:sessionId,qr_code_id:q.id,property_id:p.id,client_id:p.client_id})
      await sb.from('scan_events').insert({qr_code_id:q.id})
      await sb.from('analytics_events').insert({event_type:'page_view',qr_code_id:q.id,property_id:p.id,client_id:p.client_id,metadata:{source:'secure_traveler_v4'}})
      const start=new Date(); start.setUTCDate(1); start.setUTCHours(0,0,0,0)
      const {count}=await sb.from('scan_events').select('*',{count:'exact',head:true}).eq('qr_code_id',q.id).gte('scanned_at',start.toISOString())
      const threshold=q.monthly_threshold||50, warning=Math.ceil(threshold*((q.warning_percent||80)/100)), scans=count||0
      if(scans>=warning){
        const level=scans>=threshold?'critical':'watch';
        const {data:existing}=await sb.from('alerts').select('id').eq('qr_code_id',q.id).eq('status','open').eq('type','scan_threshold').maybeSingle()
        if(!existing) await sb.from('alerts').insert({qr_code_id:q.id,type:'scan_threshold',message:`${level==='critical'?'Seuil mensuel atteint':'QR à surveiller'} : ${scans}/${threshold} scans`})
      }
      return json({session_id:sessionId,property:{label:p.label},cities})
    }
    if(action==='guide'){
      const sessionId=String(body.session_id||''), cityId=String(body.city_id||''), language=body.language==='en'?'en':'fr'
      const {data:s}=await sb.from('traveler_sessions').select('*').eq('id',sessionId).gt('expires_at',new Date().toISOString()).maybeSingle()
      if(!s) return json({error:'session_expired'},401)
      const cities=await allowedCities(s.property_id,''); if(!cities.some((c:any)=>c.id===cityId)) return json({error:'city_unavailable'},403)
      const {data:g}=await sb.from('guide_documents').select('id,title,storage_path,version_number').eq('city_id',cityId).eq('language',language).eq('status','published').maybeSingle()
      if(!g) return json({error:'guide_not_published'},404)
      const {data:signed,error}=await sb.storage.from('city-guides').createSignedUrl(g.storage_path,900)
      if(error||!signed?.signedUrl) return json({error:'guide_unavailable'},500)
      await sb.from('traveler_sessions').update({city_id:cityId,language,last_seen_at:new Date().toISOString()}).eq('id',sessionId)
      await sb.from('analytics_events').insert({event_type:'guide_open',qr_code_id:s.qr_code_id,property_id:s.property_id,client_id:s.client_id,city_id:cityId,guide_document_id:g.id,metadata:{language,source:'secure_traveler_v4'}})
      return json({url:signed.signedUrl})
    }
    if(action==='external'){
      const sessionId=String(body.session_id||''), trackingToken=String(body.tracking_token||'')
      const {data:l}=await sb.from('establishment_links').select('id,establishment_id,action_type,destination_url,active,establishments(city_id,status)').eq('tracking_token',trackingToken).maybeSingle()
      if(!l||!l.active||(l as any).establishments?.status!=='active') return json({error:'link_unavailable'},404)
      const {data:s}=sessionId?await sb.from('traveler_sessions').select('*').eq('id',sessionId).gt('expires_at',new Date().toISOString()).maybeSingle():{data:null}
      const e:any=(l as any).establishments
      await sb.from('analytics_events').insert({event_type:'external_click',qr_code_id:s?.qr_code_id||null,property_id:s?.property_id||null,client_id:s?.client_id||null,city_id:s?.city_id||e?.city_id||null,establishment_id:l.establishment_id,establishment_link_id:l.id,metadata:{action_type:l.action_type,language:s?.language||null,attributed:Boolean(s),source:'secure_traveler_v4'}})
      return json({url:l.destination_url})
    }
    return json({error:'unknown_action'},400)
  }catch(e){console.error(e);return json({error:'internal_error'},500)}
})
