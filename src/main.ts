import './styles.css'
import { chapters, sources } from './lore'
import { next, previous, parseHash, readingTime, type State } from './engine'
import { createCosmos } from './render'
import { createSound } from './audio'
const el = <T extends HTMLElement = HTMLElement>(id:string) => document.getElementById(id) as T
let state:State=parseHash(location.hash), autoplay=false, speed=1, elapsed=0, started=performance.now()
const cosmos=createCosmos(el<HTMLCanvasElement>('cosmos')),sound=createSound()
const dialog=el<HTMLDialogElement>('field-notes')
const nav=document.querySelector<HTMLElement>('.chapter-nav')!
chapters.forEach((c,i)=>{
 const button=document.createElement('button');button.innerHTML=`<span>${String(i+1).padStart(2,'0')} /</span><strong>${c.label}</strong>`;button.setAttribute('aria-label',`Chapter ${i+1}: ${c.label}`)
 button.onclick=()=>navigate({...state,chapter:i,beat:0},'chapter');nav.append(button)
})
sources.forEach(s=>{const block=document.createElement('div'),a=document.createElement('a'),p=document.createElement('p');a.href=s.url;a.textContent=s.title;a.target='_blank';a.rel='noopener noreferrer';p.textContent=s.text;block.append(a,p);el('sources').append(block)})
function navigate(s:State, intent: 'reader' | 'chapter' | 'auto' = 'reader'){const changed=s.chapter!==state.chapter;state=s;elapsed=0;started=performance.now();history.replaceState(null,'',`#${chapters[s.chapter].id}/${s.beat+1}`);render();if(changed)sound.play(s.chapter);if(matchMedia('(max-width: 700px)').matches&&intent!=='auto'){(intent==='chapter'?document.querySelector('.theatre')!:el('reading')).scrollIntoView({block:'start',behavior:'instant'})}}
function render(){
 const c=chapters[state.chapter],b=c.beats[state.beat]
 document.documentElement.style.setProperty('--accent',c.color)
 const texts:Record<string,string>={title:c.title,subtitle:c.subtitle,clock:c.clock,medium:c.medium,'chapter-index':`MOVEMENT ${String(state.chapter+1).padStart(2,'0')} / 08`,'beat-index':`PASSAGE ${state.beat+1} OF ${c.beats.length}`,'beat-heading':b.heading,story:b.text,voice:b.voice,aside:b.aside,verse:c.verse,'science-status':c.status,'science-note':c.note,'diagram-number':`FIG. ${String(state.chapter+1).padStart(2,'0')}`,'diagram-caption':c.id==='summons'?'THE COMPLAINT IS COMING FROM INSIDE THE UNIVERSE':c.subtitle.toUpperCase(),'loop-label':state.loop?`READING ${state.loop+1} · SAME PATTERN, ANOTHER LISTENER`:'FIRST READING'}
 if(state.loop&&state.chapter===0&&state.beat===0){texts['beat-heading']='Exhibit A, reconsidered';texts.story='The summons was unchanged. Mara was not. PLEASE RETAIN YOUR BODY. IT IS YOUR RECEIPT. Last time, she had thought this meant proof of purchase. Now she wondered whether it meant proof that someone, somewhere, had received the world.';texts.aside='Same form. Different hearing.\nThe department regrets that this counts as progress.'}
 Object.entries(texts).forEach(([id,text])=>el(id).textContent=text)
 el('next').innerHTML=`${state.chapter===7&&state.beat===2?'Hear it differently':state.beat===2?'Follow the consequence':state.chapter===0&&state.beat===0?'Enter the hearing':'Continue the testimony'} <span>→</span>`
 const dots=document.querySelector('.beat-dots')!;dots.replaceChildren();c.beats.forEach((_,i)=>{const btn=document.createElement('button');btn.setAttribute('aria-label',`Read passage ${i+1}`);btn.setAttribute('aria-current',String(i===state.beat));btn.onclick=()=>navigate({...state,beat:i});dots.append(btn)})
 Array.from(nav.children).forEach((button,i)=>button.setAttribute('aria-current',i===state.chapter?'step':'false'))
 cosmos.set(state.chapter);document.body.classList.remove('flash');requestAnimationFrame(()=>document.body.classList.add('flash'))
 document.title=`${c.label} · Godstack v2gpt`
}
el('next').onclick=()=>navigate(next(state));el('back').onclick=()=>navigate(previous(state))
el('pluck').onclick=()=>{cosmos.disturb();sound.play(state.chapter)}
el('cosmos').onclick=()=>{cosmos.disturb();sound.play(state.chapter)}
el('sound').onclick=async()=>{try{const on=await sound.toggle();el('sound').setAttribute('aria-pressed',String(on));el('sound').innerHTML=`♪ <span>Sound ${on?'on':'off'}</span>`;el('sound').setAttribute('aria-label',`Sound ${on?'on':'off'}`);sound.play(state.chapter)}catch{el('sound').textContent='Audio unavailable'}}
el('autoplay').onclick=()=>{autoplay=!autoplay;elapsed=0;started=performance.now();el('autoplay').setAttribute('aria-pressed',String(autoplay));el('autoplay').textContent=autoplay?'Ⅱ Pause automatic reading':'▷ Read at my pace'}
el<HTMLSelectElement>('speed').onchange=()=>{speed=Number(el<HTMLSelectElement>('speed').value);elapsed=0}
el('notes').onclick=()=>dialog.showModal();el('close-notes').onclick=()=>dialog.close()
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}})
el('share').onclick=async()=>{try{const url=new URL(location.href);url.hash=`${chapters[state.chapter].id}/${state.beat+1}`;await navigator.clipboard.writeText(url.href);el('share-status').textContent='Passage link copied'}catch{el('share-status').textContent='Copy the address from your browser to share this passage.'}}
window.addEventListener('hashchange',()=>{state={...parseHash(location.hash),loop:state.loop};elapsed=0;render()})
window.addEventListener('keydown',e=>{if(dialog.open||(e.target instanceof HTMLElement&&/BUTTON|SELECT|INPUT|TEXTAREA|A/.test(e.target.tagName)))return;if(e.key==='ArrowRight'){e.preventDefault();navigate(next(state))}if(e.key==='ArrowLeft'){e.preventDefault();navigate(previous(state))}})
setInterval(()=>{const now=performance.now(),dt=now-started;started=now;if(autoplay&&!document.hidden&&!dialog.open){elapsed+=Math.min(dt,500);const duration=readingTime(el('story').textContent!+' '+el('aside').textContent!,speed);if(elapsed>=duration)navigate(next(state),'auto');const bar=document.querySelector<HTMLElement>('.timer span')!;bar.style.width=`${Math.min(100,elapsed/duration*100)}%`}else if(!autoplay){document.querySelector<HTMLElement>('.timer span')!.style.width='0%'}},100)
render()
