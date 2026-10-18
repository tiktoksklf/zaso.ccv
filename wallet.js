/* zaso.cc public Solana wallet viewer. No keys, transaction signing or custody. */
(function(global){
  'use strict';
  const RPC_ENDPOINTS=['https://api.mainnet-beta.solana.com','https://solana-rpc.publicnode.com'];
  const PRICE_ENDPOINTS=[
    {url:'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',read:data=>Number(data?.solana?.usd)},
    {url:'https://api.coinbase.com/v2/prices/SOL-USD/spot',read:data=>Number(data?.data?.amount)}
  ];
  const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  function validAddress(address){
    if(typeof address!=='string'||address.length<32||address.length>44)return false;
    const bytes=[0];
    for(const char of address){
      const idx=alphabet.indexOf(char);
      if(idx<0)return false;
      let carry=idx;
      for(let i=0;i<bytes.length;i++){
        carry+=bytes[i]*58;
        bytes[i]=carry&255;
        carry>>=8;
      }
      while(carry){bytes.push(carry&255);carry>>=8;}
    }
    let leading=0;
    for(const char of address){if(char==='1')leading++;else break;}
    const decoded=(bytes.length===1&&bytes[0]===0?0:bytes.length)+leading;
    return decoded===32;
  }
  function shorten(address){return address.slice(0,5)+'…'+address.slice(-5);}
  async function fetchJSON(url,opts={}){
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8500);
    try{
      const response=await fetch(url,{...opts,signal:controller.signal,cache:'no-store'});
      if(!response.ok)throw Error('Service responded '+response.status);
      return await response.json();
    }finally{clearTimeout(timeout);}
  }
  async function getBalance(address){
    let last;
    for(const url of RPC_ENDPOINTS){
      try{
        const data=await fetchJSON(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'getBalance',params:[address,{commitment:'confirmed'}]})});
        const lamports=data?.result?.value;
        if(!Number.isSafeInteger(lamports)||lamports<0)throw Error('Invalid RPC balance');
        return lamports/1e9;
      }catch(e){last=e;}
    }
    throw last||Error('Solana RPC unavailable');
  }
  async function getPrice(){
    let last;
    for(const source of PRICE_ENDPOINTS){
      try{
        const price=source.read(await fetchJSON(source.url));
        if(!Number.isFinite(price)||price<=0)throw Error('Invalid live price');
        return price;
      }catch(e){last=e;}
    }
    throw last||Error('SOL/USD price unavailable');
  }
  const formatUSD=(amount)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(amount);
  const formatSOL=(amount)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:5}).format(amount);
  function setup(element,address,opts={}){
    if(!element||!validAddress(address))return false;
    const usd=element.querySelector('[data-wallet-usd]');
    const sub=element.querySelector('[data-wallet-detail]');
    const updated=element.querySelector('[data-wallet-updated]');
    const refresh=element.querySelector('[data-wallet-refresh]');
    const copy=element.querySelector('[data-wallet-copy]');
    const addressText=element.querySelector('[data-wallet-address]');
    const explorer=element.querySelector('[data-wallet-explorer]');
    if(addressText){addressText.textContent=shorten(address);addressText.title=address;}
    if(explorer)explorer.href='https://solscan.io/account/'+encodeURIComponent(address);
    if(copy)copy.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(address);copy.textContent='Copied ✓';setTimeout(()=>copy.textContent='Copy',1600)}
      catch{copy.textContent='Copy unavailable';setTimeout(()=>copy.textContent='Copy',1900)}
    });
    let working=false,lastLoad=0,timer;
    async function update(force=false){
      if(document.hidden||working||(!force&&Date.now()-lastLoad<60000))return;
      lastLoad=Date.now();working=true;
      if(refresh)refresh.disabled=true;
      if(updated)updated.textContent='Updating live data…';
      try{
        const [balance,price]=await Promise.all([getBalance(address),getPrice()]);
        if(usd)usd.textContent=formatUSD(balance*price);
        if(sub)sub.textContent=formatSOL(balance)+' SOL · $'+price.toLocaleString('en-US',{maximumFractionDigits:2})+' / SOL';
        if(updated)updated.textContent='Estimated USD value · Updated '+new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
      }catch(e){
        if(usd&&!usd.dataset.loaded)usd.textContent='Unavailable';
        if(sub&&!sub.dataset.loaded)sub.textContent='Unable to load public balance / USD price';
        if(updated)updated.textContent='Live data unavailable · Try refresh';
      }finally{
        if(usd)usd.dataset.loaded='true';
        if(sub)sub.dataset.loaded='true';
        if(refresh)refresh.disabled=false;
        working=false;
      }
    }
    if(refresh)refresh.addEventListener('click',()=>update(false));
    update(true);
    if(!opts.noAutoRefresh){
      timer=setInterval(()=>update(),65000);
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
      addEventListener('pagehide',()=>clearInterval(timer),{once:true});
    }
    return true;
  }
  global.ZasoWallet={validAddress,shorten,setup};
})(window);
