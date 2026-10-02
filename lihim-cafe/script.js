const CHAT_API_ENDPOINT='/api/chat';
let chatHistory=[];
// Hours: Mon-Fri 11am-9pm, Sat-Sun 7am-9pm (Asia/Manila)
function isOpen(){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
  const g=t=>p.find(x=>x.type===t).value;
  const wd=g('weekday'),mins=(+g('hour')%24)*60+ +g('minute');
  const weekend=wd==='Sat'||wd==='Sun';
  return mins>=(weekend?420:660)&&mins<1260;
}
function updateStatus(){
  const d=document.getElementById('status-dot'),t=document.getElementById('status-text');
  const o=isOpen();d.className=o?'on':'off';t.textContent=o?'Open now':'Closed now';
}
async function getBotResponse(msg){
  chatHistory.push({role:'user',parts:[{text:msg}]});
  if(chatHistory.length>20)chatHistory=chatHistory.slice(-20);
  try{
    const r=await fetch(CHAT_API_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:chatHistory})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok){chatHistory.pop();return r.status===429?'Many questions at once. Please wait a few seconds and try again.':'Something went wrong on our end. Please try again in a moment.';}
    const reply=data?.reply?.trim();
    if(!reply){chatHistory.pop();return 'I did not catch that. Could you ask it another way?';}
    chatHistory.push({role:'model',parts:[{text:reply}]});return reply;
  }catch(e){chatHistory.pop();return 'The connection dropped. Please try again.';}
}
const $=id=>document.getElementById(id);
function addMsg(text,who){const d=document.createElement('div');d.className='msg '+who;d.textContent=text;$('chat-messages').appendChild(d);$('chat-messages').scrollTop=1e6;return d;}
let first=true,sending=false;
function toggleChat(){
  const w=$('chat-window');const hidden=w.classList.toggle('chat-hidden');
  if(!hidden){if(first){addMsg('Hello! I can help with our hours, the menu and getting here. What would you like to know?','bot');first=false;}setTimeout(()=>$('chat-input').focus(),100);}
}
async function send(){
  const i=$('chat-input'),m=i.value.trim();if(!m||sending)return;
  sending=true;addMsg(m,'me');i.value='';const t=addMsg('','bot');t.classList.add('typing');t.innerHTML='<i></i><i></i><i></i>';
  const reply=await getBotResponse(m);t.classList.remove('typing');t.textContent=reply;sending=false;
}
function setMenu(open){
  $('mobile-menu').classList.toggle('open',open);
  $('hamburger').setAttribute('aria-expanded',open);$('hamburger').textContent=open?'Close':'Menu';
}
document.addEventListener('DOMContentLoaded',()=>{
  updateStatus();setInterval(updateStatus,60000);
  $('hamburger').addEventListener('click',()=>setMenu(!$('mobile-menu').classList.contains('open')));
  document.querySelectorAll('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  const sc=$('menu-scroll');
  $('m-left').addEventListener('click',()=>sc.scrollBy({left:-400,behavior:'smooth'}));
  $('m-right').addEventListener('click',()=>sc.scrollBy({left:400,behavior:'smooth'}));
  const lb=$('lightbox');
  sc.addEventListener('click',e=>{const p=e.target.closest('.page');if(!p)return;const im=p.querySelector('img');$('lb-img').src=im.src;$('lb-img').alt=im.alt;lb.hidden=false;document.body.style.overflow='hidden';});
  const close=()=>{lb.hidden=true;document.body.style.overflow='';};
  $('lb-close').addEventListener('click',close);
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)close();});
  ['chat-fab','chat-close','chat-toggle-hero'].forEach(id=>$(id).addEventListener('click',toggleChat));
  $('chat-send').addEventListener('click',send);
  $('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send();}});
});

// ==================== MOTION ====================
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root=document.documentElement;

  // Intro: plays once per session; tap to skip
  function endIntro(skip){
    const intro=document.getElementById('intro');
    if(skip)root.classList.add('intro-skip');
    if(intro)intro.remove();
    document.body.classList.remove('intro-lock');
    try{sessionStorage.setItem('lihimIntro','1')}catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const intro=document.getElementById('intro');
    if(intro&&!root.classList.contains('no-intro')&&!reduce){
      document.body.classList.add('intro-lock');
      intro.addEventListener('click',()=>endIntro(true));
      setTimeout(()=>endIntro(false),4050);
    }else if(intro){intro.remove();}

    // Split headings into words for a masked rise
    document.querySelectorAll('.split').forEach(el=>{
      const text=el.textContent.trim();el.setAttribute('aria-label',text);el.textContent='';
      text.split(/\s+/).forEach((w,i)=>{
        const o=document.createElement('span');o.className='w';o.setAttribute('aria-hidden','true');
        const s=document.createElement('span');s.style.setProperty('--wi',i);s.textContent=w;
        o.appendChild(s);el.appendChild(o);if(i<text.split(/\s+/).length-1)el.appendChild(document.createTextNode(' '));
      });
    });

    // Stagger menu pages in groups of four
    document.querySelectorAll('#menu-scroll .page').forEach((p,i)=>p.style.setProperty('--i',i%4));

    // Reveal on scroll
    const targets=document.querySelectorAll('.rv,.wipe,.split,.hours div');
    // The arch is clipped to nothing until revealed, so watch its parent instead
    const arches=[...document.querySelectorAll('.arch')];
    if(!('IntersectionObserver' in window)||reduce){targets.forEach(t=>t.classList.add('in'));arches.forEach(a=>a.classList.add('in'));}
    else{
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.18,rootMargin:'0px 0px -6% 0px'});
      targets.forEach(t=>io.observe(t));
      arches.forEach(a=>{const ao=new IntersectionObserver(es=>{if(es[0].isIntersecting){a.classList.add('in');ao.disconnect();}},{threshold:.25});ao.observe(a.parentElement);});
    }

    // Active nav link
    const links=[...document.querySelectorAll('.links a')];
    const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
    if('IntersectionObserver' in window){
      const so=new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));}
      }),{rootMargin:'-45% 0px -50% 0px'});
      secs.forEach(s=>s&&so.observe(s));
    }
  });

  // Scroll-linked: progress bar, nav hide/show, hero and card parallax
  const nav=document.getElementById('nav'),bar=document.getElementById('progress');
  let lastY=0,ticking=false;
  function onScroll(){
    const y=window.scrollY,max=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform='scaleX('+(max>0?y/max:0)+')';
    nav.classList.toggle('scrolled',y>20);
    const menuOpen=document.getElementById('mobile-menu').classList.contains('open');
    nav.classList.toggle('hide',y>400&&y>lastY+4&&!menuOpen);
    if(y<lastY-4||y<400)nav.classList.remove('hide');
    lastY=y;
    if(!reduce){
      const hb=document.querySelector('.hero-bg');
      if(hb&&y<innerHeight*1.2)hb.style.transform='translateY('+(y*0.22)+'px)';
      document.querySelectorAll('[data-par]').forEach(im=>{
        const r=im.parentElement.getBoundingClientRect();
        if(r.bottom<0||r.top>innerHeight)return;
        im.style.setProperty('--py',((r.top+r.height/2-innerHeight/2)*-0.06).toFixed(1)+'px');
      });
    }
    ticking=false;
  }
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true;}},{passive:true});
  window.addEventListener('load',onScroll);
})();
