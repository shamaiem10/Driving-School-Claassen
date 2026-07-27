const header=document.querySelector('#site-header');
const hero=document.querySelector('.hero');
const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
const backToTop=document.querySelector('.back-to-top');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const setHeaderHeight=()=>document.documentElement.style.setProperty('--header-height',`${header.offsetHeight}px`);
const handleScroll=()=>{
  const y=window.scrollY;
  header.classList.toggle('is-scrolled',y>60);
  backToTop.classList.toggle('is-visible',y>400);
  setHeaderHeight();
};
setHeaderHeight();
window.addEventListener('resize',setHeaderHeight);
window.addEventListener('scroll',handleScroll,{passive:true});
handleScroll();
requestAnimationFrame(()=>hero.classList.add('is-ready'));
menuButton.addEventListener('click',()=>{
  const open=nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');
  menuButton.innerHTML=`<i class="bi ${open?'bi-x-lg':'bi-list'}" aria-hidden="true"></i>`;
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Menü öffnen');
  menuButton.innerHTML='<i class="bi bi-list" aria-hidden="true"></i>';
}));
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
const reveals=[...document.querySelectorAll('.reveal-x,.reveal-scale,.reveal-clip')];
if(reduced){reveals.forEach(el=>el.classList.add('is-visible'));}else{
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const siblings=[...entry.target.parentElement.children].filter(el=>el.matches('.reveal-x,.reveal-scale,.reveal-clip'));
      const index=Math.max(0,siblings.indexOf(entry.target));
      entry.target.style.transitionDelay=`${index*80}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },{threshold:.14,rootMargin:'0px 0px -5%'});
  reveals.forEach(el=>observer.observe(el));
}

document.addEventListener('DOMContentLoaded', function(){
  const NAMESPACE = "Driving School Claassen";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  if(!launcher || !panel || !form || !input || !messages){ return; }

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  if(closeBtn){ closeBtn.addEventListener('click', function(){ setOpen(false); }); }

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
});
