// Quiet original phrase, with the pause that becomes the narrative's hinge.
export function createSound() {
  let ctx: AudioContext | undefined, enabled=false
  const ratios=[1, 5/4, 3/2, 0, 4/3, 1]
  return {
    async toggle(){
      if(!ctx)ctx=new AudioContext()
      if(ctx.state==='suspended')await ctx.resume()
      enabled=!enabled; return enabled
    },
    play(chapter:number){
      if(!enabled||!ctx||ctx.state!=='running')return
      const now=ctx.currentTime, root=146.83*Math.pow(2,(chapter%4)*2/12)
      ratios.forEach((ratio,i)=>{
        if(!ratio)return
        const osc=ctx!.createOscillator(),gain=ctx!.createGain()
        osc.type='sine';osc.frequency.value=root*ratio
        const t=now+i*.27;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.025,t+.025);gain.gain.exponentialRampToValueAtTime(.0001,t+.7)
        osc.connect(gain);gain.connect(ctx!.destination);osc.start(t);osc.stop(t+.75)
        osc.onended=()=>{osc.disconnect();gain.disconnect()}
      })
    },
  }
}
