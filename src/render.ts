// Original mathematical engravings. These are illustrations, not physical simulations.
export function createCosmos(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { set: (_index: number) => {}, disturb: () => {} }
  const g: CanvasRenderingContext2D = ctx
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let index = 0, time = 0, pulse = 0, width = 0, height = 0, last = 0
  const colors = ['217,183,116','122,203,197','183,165,237','223,150,122','166,198,151','141,188,233','213,180,127','217,183,116']
  function resize() {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height
    const dpr = Math.min(devicePixelRatio || 1, 2)
    canvas.width = width * dpr; canvas.height = height * dpr; g.setTransform(dpr,0,0,dpr,0,0)
    draw()
  }
  function point(x: number, y: number, z: number): [number, number] {
    const a = .38 + time * .045, b = -.45
    const xx = x * Math.cos(a) + z * Math.sin(a), zz = -x * Math.sin(a) + z * Math.cos(a)
    const yy = y * Math.cos(b) - zz * Math.sin(b), z2 = y * Math.sin(b) + zz * Math.cos(b)
    const p = 3.6 / (3.6 + z2)
    const scale = Math.min(width * .29, height * .44) * (1 + pulse * .04)
    return [width * .53 + xx * scale * p, height * .5 + yy * scale * p]
  }
  function line(points: number[][], alpha: number, w = .6) {
    g.strokeStyle = `rgba(${colors[index]},${alpha})`; g.lineWidth = w; g.beginPath()
    points.forEach((p,i) => {const [x,y] = point(p[0],p[1],p[2]); if(i===0)g.moveTo(x,y);else g.lineTo(x,y)})
    g.stroke()
  }
  function orb(p: number[], r: number, alpha: number) {
    const [x,y] = point(p[0],p[1],p[2]);g.fillStyle=`rgba(${colors[index]},${alpha})`;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()
  }
  function torus() {
    for(let j=0;j<34;j++) {
      const v=j/34*Math.PI*2
      const pts=[]
      for(let k=0;k<=100;k++) {
        const u=k/100*Math.PI*2, r=.83+.33*Math.cos(v)
        pts.push([r*Math.cos(u),.33*Math.sin(v),r*Math.sin(u)])
      }
      line(pts,.23)
    }
    for(let j=0;j<64;j++) {
      // One missing rib is the story's returning visual signature.
      if(j===8 || j===9)continue
      const u=j/64*Math.PI*2, pts=[]
      for(let k=0;k<=32;k++) {const v=k/32*Math.PI*2;pts.push([(.83+.33*Math.cos(v))*Math.cos(u),.33*Math.sin(v),(.83+.33*Math.cos(v))*Math.sin(u)])}
      line(pts,.35)
    }
    for(let j=0;j<12;j++){const u=j/12*6.28+time*.12;orb([.83*Math.cos(u),.03,.83*Math.sin(u)],2,.9)}
  }
  function ocean() {
    for(let j=0;j<23;j++) {
      const pts=[]
      for(let k=0;k<=80;k++){const x=k/40-1;pts.push([x*1.3,Math.sin(x*4+time*.35+j*.25)*.11+(j-11)*.047,(j-11)*.08])}
      line(pts,.16+j/95)
    }
    const pts=[]
    for(let k=0;k<100;k++){const u=k/99*6.28;pts.push([Math.cos(u)*.8,Math.sin(u)*.23-.26,Math.sin(u)*.14])}
    line(pts,.9,1.1);orb([.66,-.26,0],3,.9)
    for(let j=0;j<7;j++)orb([-.7+j*.17,.4+Math.sin(j+time*.4)*.05,-.3],2,.7)
  }
  function membranes() {
    for(let j=0;j<27;j++) {
      const pts=[];const v=j/26*Math.PI
      for(let k=0;k<=100;k++){const u=k/100*Math.PI*2;const r=.9+.16*Math.sin(u*3+v*4+time*.3);pts.push([r*Math.sin(v)*Math.cos(u),r*Math.cos(v),r*Math.sin(v)*Math.sin(u)])}
      line(pts,.4)
    }
    for(let j=0;j<70;j++){const a=j*2.3999,y=1-2*j/70,r=Math.sqrt(1-y*y);orb([r*Math.cos(a),y,r*Math.sin(a)],1.6,.8)}
  }
  function choir() {
    for(let j=0;j<9;j++) {
      const pts=[]
      for(let k=0;k<=240;k++){const u=k/240*Math.PI*2;pts.push([Math.sin(u*3+j*.11),Math.cos(u*2+j*.11)*.75,Math.sin(u*5+time*.1)*.35])}
      line(pts,.25+j*.035)
    }
  }
  function body() {
    for(let j=0;j<24;j++) {
      const pts=[]
      for(let k=0;k<=70;k++){const y=k/35-1,r=.23+.18*Math.cos(y*5)+.12*Math.cos(y*9),a=j/24*6.28;pts.push([r*Math.cos(a),y,r*Math.sin(a)])}
      line(pts,.45)
    }
    for(let j=0;j<5;j++)line([[-.025+j*.012,-.95,0],[-.025+j*.012,1,0]],.8)
    for(let j=0;j<6;j++){const a=time*.3+j;orb([Math.cos(a)*.7,Math.sin(a)*.7,.2],2,.8)}
  }
  function machines() {
    const pts:number[][]=[]
    for(let y=0;y<5;y++)for(let x=0;x<5;x++)for(let z=0;z<3;z++)pts.push([(x-2)*.38,(y-2)*.38,(z-1)*.45])
    for(let i=0;i<pts.length;i++){const p=pts[i];orb(p,1.6,.8);for(const j of [i+3,i+15,i+1])if(j<pts.length&&Math.hypot(...p.map((v,k)=>v-pts[j][k]))<.5)line([p,pts[j]],.3)}
    const p=pts[Math.floor(time*3)%pts.length];orb(p,5,.9)
  }
  function galaxies() {
    for(let j=0;j<750;j++) {
      const a=j*2.3999+time*.025,r=Math.sqrt((j+.5)/750),arm=j%3*2.094+r*5.4
      const scatter=Math.sin(j*19.13)*.13
      orb([Math.cos(arm+scatter)*r*1.25,Math.sin(a)*.055,Math.sin(arm+scatter)*r*1.25],j%17===0?2: .8,.25+(j%7)/12)
    }
    for(let j=0;j<5;j++){const a=j*1.257;line([[0,0,0],[Math.cos(a)*1.15,.2,Math.sin(a)*1.15]],.24)}
  }
  function draw() {
    if(!width)return
    g.clearRect(0,0,width,height)
    const cx=width*.53, cy=height*.5, r=Math.min(height*.45,width*.35)
    const halo=g.createRadialGradient(cx,cy,0,cx,cy,r*1.3);halo.addColorStop(0,`rgba(${colors[index]},.065)`);halo.addColorStop(1,`rgba(${colors[index]},0)`);g.fillStyle=halo;g.fillRect(0,0,width,height)
    g.strokeStyle=`rgba(${colors[index]},.13)`;g.lineWidth=.6
    for(let j=0;j<3;j++){g.beginPath();g.ellipse(cx,cy,r*(1.06+j*.12),r*(1.06+j*.12),0,0,Math.PI*2);g.stroke()}
    for(let j=0;j<72;j++){const a=j/72*6.28,rr=r*1.32;g.beginPath();g.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);g.lineTo(cx+Math.cos(a)*(rr+(j%6===0?7:3)),cy+Math.sin(a)*(rr+(j%6===0?7:3)));g.stroke()}
    g.setLineDash([2,7]);g.beginPath();g.moveTo(cx-r*1.48,cy);g.lineTo(cx+r*1.48,cy);g.moveTo(cx,cy-r*1.48);g.lineTo(cx,cy+r*1.48);g.stroke();g.setLineDash([])
    if(index===0||index===7)torus();else if(index===1)ocean();else if(index===2)membranes();else if(index===3)choir();else if(index===4)body();else if(index===5)machines();else galaxies()
    if(pulse>.01){g.strokeStyle=`rgba(${colors[index]},${pulse*.4})`;g.beginPath();g.arc(cx,cy,r*(1.6-pulse*.6),0,6.28);g.stroke()}
    g.font='8px monospace';g.fillStyle=`rgba(${colors[index]},.65)`;g.fillText(index===7?'CONSEQUENCE ACKNOWLEDGED':'RELATIONS / NOT RANKINGS',cx-r*.75,cy+r*1.48)
  }
  function frame(now:number){
    const dt=Math.min((now-last)/1000,.05);last=now
    if(!document.hidden&&!reduced.matches){time+=dt;pulse=Math.max(0,pulse-dt*.65);draw()}
    requestAnimationFrame(frame)
  }
  new ResizeObserver(resize).observe(canvas);reduced.addEventListener('change',draw);requestAnimationFrame(frame)
  return {set(i:number){index=i;draw()},disturb(){pulse=1;time+=.2;draw()}}
}
