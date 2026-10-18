import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';
export const stripe=new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!,{apiVersion:'2024-12-18.acacia'});
export const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const allowed=['https://zaso.cc','https://www.zaso.cc'];
export function cors(req:Request){const origin=req.headers.get('origin')||'';return {'Access-Control-Allow-Origin':allowed.includes(origin)?origin:allowed[0],'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};}
export function json(req:Request,obj:unknown,status=200){return new Response(JSON.stringify(obj),{status,headers:{...cors(req),'Content-Type':'application/json'}})}
export async function authorized(req:Request){const auth=req.headers.get('Authorization');if(!auth?.startsWith('Bearer '))throw Error('Unauthorized');const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});const {data:{user},error}=await client.auth.getUser();if(error||!user)throw Error('Unauthorized');return user;}
export function handleError(req:Request,e:unknown){const message=e instanceof Error?e.message:'Request failed';return json(req,{error:message},message==='Unauthorized'?401:400)}
