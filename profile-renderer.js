/* Shared public profile and sample preview renderer. Uses safe DOM APIs for user content. */
(function(global){
  'use strict';
  const TEMPLATES=[
    {id:'afterhours',name:'After Hours',description:'Editorial plum · ambient luxury',accent:'#cfb5ed'},
    {id:'velvet',name:'Velvet',description:'Midnight rose · glass panels',accent:'#f2a7c9'},
    {id:'noir',name:'Noir',description:'Black chrome · quiet confidence',accent:'#e6e6e6'},
    {id:'eclipse',name:'Eclipse',description:'Electric violet · night sky',accent:'#b099ff'},
    {id:'jade',name:'Jade',description:'Emerald glow · deep forest',accent:'#81e6bb'},
    {id:'champagne',name:'Champagne',description:'Editorial cream · soft gold',accent:'#bd9561'},
    {id:'ember',name:'Ember',description:'Warm copper · sunset smoke',accent:'#ffbd90'}
  ];
  const legacy={nocturne:'afterhours',aurora:'eclipse',editorial:'champagne',obsidian:'noir',solstice:'ember'};
  function canonical(id){const mapped=legacy[id]||id;return TEMPLATES.some(t=>t.id===mapped)?mapped:'afterhours';}
  function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
  function addText(parent,tag,cls,text){const e=element(tag,cls,text);parent.append(e);return e;}
  function sectionTitle(heading,number){const row=element('div','z-section-label');addText(row,'span','',heading);addText(row,'span','',number);return row;}
  function makeAvatar(profile){
    const avatar=element('div','z-avatar-shell');
    if(typeof profile.avatar_url==='string'&&profile.avatar_url.startsWith('https://')){
      const image=element('img','creator-avatar');image.src=profile.avatar_url;image.alt='Profile avatar';image.referrerPolicy='no-referrer';avatar.append(image);
    }else{
      addText(avatar,'div','creator-initial',(profile.display_name||profile.username||'Z').charAt(0).toUpperCase());
    }
    addText(avatar,'span','z-avatar-star','✦');return avatar;
  }
  function safeExternal(url){try{const u=new URL(url);if(['https:','http:'].includes(u.protocol))return u.href;}catch{}return null;}
  function makeLink(link,onAdult,demo){
    const url=safeExternal(link.url);if(!url&&!demo)return null;
    const info=typeof linkMetadata==='function'?linkMetadata(link.icon):{platform:'custom',adult:false};
    const adult=!demo&&(info.adult||(typeof isAdultDomain==='function'&&isAdultDomain(url)));
    const a=element('a','z-social-card');
    a.href=url||'#';a.target='_blank';a.rel='noopener noreferrer';
    if(demo){a.addEventListener('click',e=>e.preventDefault());a.setAttribute('aria-disabled','true');}
    const iconBox=element('span','z-social-icon');
    const gif=String(link.icon||'').split('|').slice(2).join('|');
    if(gif.startsWith('https://')&&!demo){
      const img=element('img','zaso-link-gif');img.src=gif;img.alt='';img.loading='lazy';
      img.onerror=()=>{img.replaceWith(socialIcon(info.platform))};iconBox.append(img);
    }else if(typeof socialIcon==='function')iconBox.append(socialIcon(info.platform));
    else iconBox.textContent='↗';
    a.append(iconBox);
    const copy=element('span','z-social-copy');
    const title=(link.title||'Link').trim();
    addText(copy,'strong','z-social-title',title);
    const platform=typeof socialInfo==='function'?socialInfo(info.platform)?.name:'';
    addText(copy,'small','z-social-subtitle',platform&&platform!==title?platform:'Explore link');
    a.append(copy);
    if(adult){const tag=element('span','z-adult-tag','18+');a.append(tag);a.addEventListener('click',e=>{e.preventDefault();if(onAdult)onAdult(url);});}
    addText(a,'span','z-arrow','↗');
    return a;
  }
  function walletCard(address,demo){
    const wallet=element('section','z-wallet');
    wallet.append(sectionTitle('ON THE CHAIN','SOLANA / USD'));
    const box=element('div','z-wallet-box');
    const head=element('div','z-wallet-header');
    const emblem=element('span','z-wallet-logo','≋');emblem.setAttribute('aria-hidden','true');head.append(emblem);
    const name=element('div','z-wallet-name');addText(name,'strong','','My Wallet');addText(name,'small','','Public Solana address · watch-only');head.append(name);
    const refresh=element('button','z-refresh','↻ Refresh');refresh.type='button';refresh.setAttribute('data-wallet-refresh','');head.append(refresh);box.append(head);
    const caption=addText(box,'span','z-wallet-caption','ESTIMATED VALUE · USD');
    caption.setAttribute('aria-label','Estimated United States dollar value');
    const usd=addText(box,'div','z-wallet-usd',demo?'$12,480.00':'Loading…');usd.setAttribute('data-wallet-usd','');
    const detail=addText(box,'p','z-wallet-detail',demo?'Sample preview · 80.0000 SOL':'Reading public balance and current SOL/USD price…');detail.setAttribute('data-wallet-detail','');
    const addressRow=element('div','z-address-row');
    const addressLabel=addText(addressRow,'span','z-address','');addressLabel.setAttribute('data-wallet-address','');
    const copy=element('button','z-copy','Copy');copy.type='button';copy.setAttribute('data-wallet-copy','');addressRow.append(copy);box.append(addressRow);
    const foot=element('div','z-wallet-foot');
    const date=addText(foot,'small','',demo?'Demo balance · for preview only':'Live public on-chain data');date.setAttribute('data-wallet-updated','');
    const explorer=addText(foot,'a','z-wallet-explorer','View on Solscan ↗');explorer.target='_blank';explorer.rel='noopener noreferrer';explorer.setAttribute('data-wallet-explorer','');
    explorer.href=demo?'https://solscan.io':'https://solscan.io/account/'+encodeURIComponent(address);
    if(demo)explorer.addEventListener('click',e=>e.preventDefault());
    foot.append(explorer);box.append(foot);wallet.append(box);
    if(demo){addressLabel.textContent='Demo5…Wallet';copy.disabled=true;refresh.disabled=true;}
    else{addressLabel.textContent=address;}
    return wallet;
  }
  function render(stage,profile,links=[],options={}){
    const demo=!!options.demo;
    const theme=profile.theme||{};
    stage.dataset.template=canonical(theme.template);
    stage.classList.toggle('z-demo',demo);
    stage.style.removeProperty('background-image');
    stage.style.removeProperty('--accent');
    if(theme.useAccent&&/^#[0-9a-f]{6}$/i.test(profile.accent_color||''))stage.style.setProperty('--accent',profile.accent_color);
    if(!demo&&typeof profile.background_url==='string'&&profile.background_url.startsWith('https://')){
      stage.style.backgroundImage='linear-gradient(#090812b8,#090812df),url('+JSON.stringify(profile.background_url)+')';
      stage.style.backgroundSize='cover';stage.style.backgroundPosition='center';
    }
    const card=stage.querySelector('.creator');if(!card)throw Error('Missing profile container');
    card.replaceChildren();
    const inner=element('div','z-profile-inner');card.append(inner);
    const hero=element('div','z-profile-hero');
    addText(hero,'div','z-profile-sigil','✧');hero.append(makeAvatar(profile));
    addText(hero,'div','z-eyebrow',theme.eyebrow||'MY LITTLE CORNER OF THE INTERNET');
    const name=String(profile.display_name||profile.username||'your name').trim();
    const display=addText(hero,'h1','z-display-name',name);display.title=name;
    addText(hero,'p','z-handle','@'+String(profile.username||'yourusername'));
    if(profile.bio)addText(hero,'p','creator-bio',profile.bio);
    else addText(hero,'p','creator-bio','a little offline. a little everywhere.');
    inner.append(hero);
    const good=(links||[]).filter(l=>l&&((demo&&l.title)||safeExternal(l.url)));
    if(good.length){
      const primary=element('section','z-primary-links');primary.append(sectionTitle('FIND ME HERE','01 / SOCIALS'));
      const first=element('div','creator-links z-featured-links');
      const firstLink=makeLink(good[0],options.onAdult,demo);if(firstLink)first.append(firstLink);
      primary.append(first);inner.append(primary);
      if(good.length>1){
        const extra=element('section','z-extra-links');extra.append(sectionTitle('THE COLLECTION',String(good.length-1).padStart(2,'0')+' LINKS'));
        const list=element('div','creator-links z-link-grid');
        for(const link of good.slice(1)){const node=makeLink(link,options.onAdult,demo);if(node)list.append(node);}
        extra.append(list);inner.append(extra);
      }
    }
    const address=String(theme.solanaWallet||'').trim();
    if(demo||((theme.showWallet!==false)&&global.ZasoWallet?.validAddress(address))){
      const wc=walletCard(address,demo);inner.append(wc);
      if(!demo)global.ZasoWallet.setup(wc,address);
    }
    if(options.showAd)addText(inner,'div','creator-ad','Advertisement space · zaso.cc Free');
    if(options.showBrand!==false)addText(inner,'div','creator-brand','✧ made with zaso.cc');
    return card;
  }
  function demoProfile(templateId){return {
    username:'anthony',display_name:'anthony.',bio:'a little offline. a little everywhere.',
    avatar_url:null,background_url:null,theme:{template:canonical(templateId),eyebrow:'MY LITTLE CORNER OF THE INTERNET',showWallet:true}
  };}
  function demoLinks(){return [
    {title:'Instagram',url:'https://instagram.com/',icon:'safe|instagram'},
    {title:'@maybe',url:'https://tiktok.com/',icon:'safe|tiktok'},
    {title:'@Xanax',url:'https://tiktok.com/',icon:'safe|tiktok'},
    {title:'@bruh',url:'https://tiktok.com/',icon:'safe|tiktok'},
    {title:'@oos',url:'https://tiktok.com/',icon:'safe|tiktok'},
  ];}
  global.ZasoProfiles={TEMPLATES,canonical,render,demoProfile,demoLinks};
})(window);
