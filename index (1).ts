import {stripe,admin} from '../_shared/common.ts';
const prices:{[key:string]:string}={'price_1URhdrAPoV9ADP24ugsV4jAo':'pro','price_1URheXAPoV9ADP24MeFIe7LU':'elite'};
async function sync(subscription:import('npm:stripe@17.7.0').default.Subscription){const customerId=typeof subscription.customer==='string'?subscription.customer:subscription.customer.id;let userId=subscription.metadata.supabase_user_id;
if(!userId){const {data}=await admin.from('subscriptions').select('user_id').eq('stripe_customer_id',customerId).maybeSingle();userId=data?.user_id}
if(!userId){const customer=await stripe.customers.retrieve(customerId);if(!customer.deleted)userId=customer.metadata.supabase_user_id}
if(!userId)throw Error('Subscription owner not found');
const active=['active','trialing'].includes(subscription.status);const priceId=subscription.items.data[0]?.price.id;const plan=active?(prices[priceId]||'free'):'free';
const {error}=await admin.from('subscriptions').upsert({user_id:userId,plan,status:subscription.status,stripe_customer_id:customerId,stripe_subscription_id:subscription.id,current_period_end:new Date(subscription.current_period_end*1000).toISOString(),cancel_at_period_end:subscription.cancel_at_period_end,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;
}
Deno.serve(async req=>{if(req.method!=='POST')return new Response('Method not allowed',{status:405});try{const signature=req.headers.get('stripe-signature');if(!signature)return new Response('Missing signature',{status:400});const raw=await req.text();const secret=Deno.env.get('STRIPE_WEBHOOK_SECRET');if(!secret)throw Error('Webhook secret not configured');const event=await stripe.webhooks.constructEventAsync(raw,signature,secret);
if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){await sync(event.data.object as import('npm:stripe@17.7.0').default.Subscription)}
if(event.type==='checkout.session.completed'){const checkout=event.data.object as import('npm:stripe@17.7.0').default.Checkout.Session;if(checkout.mode==='subscription'&&checkout.subscription){const subscription=await stripe.subscriptions.retrieve(checkout.subscription as string);await sync(subscription)}}
return new Response('ok',{status:200});}catch(e){console.error(e);return new Response('Webhook processing failed',{status:400})}});
