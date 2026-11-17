export interface BossHealthSource {boss:number;hp:number;max:number}
export function bossHealthRows<T extends BossHealthSource>(foes:readonly T[]){return foes.filter(b=>b.boss>=0&&b.hp>0&&b.max>0).map(b=>({source:b,id:b.boss,health:Math.max(0,b.hp),max:b.max,ratio:Math.max(0,Math.min(1,b.hp/b.max))}))}
/** Display-only trail: never writes to combat health. Healing snaps immediately. */
export function bossHealthTrail(previous:number,current:number,delta:number,motion:boolean){return !motion||current>=previous?current:Math.max(current,previous-Math.max(0,delta)/500)}
