import {test} from 'node:test';import assert from 'node:assert/strict';
import {WeaponInstances} from '../src/weapons/GroundWeapon';
import {gun,WEAPONS,isMelee,reload} from '../src/weapons/arsenal';
import {Burning} from '../src/weapons/Burning';
import {Ultimate} from '../src/systems/Ultimate';
import {baseStats} from '../src/config/progression';
import {fireInterval,magazineCapacity,playerDamage} from '../src/systems/PlayerModifiers';
import {readFileSync} from 'node:fs';

test('instancia exclusiva: caída, dos reclamantes, vuelo y persistencia sin rellenar',()=>{
 const r=new WeaponInstances('test'),g=gun(9);g.ammo=2;g.reserve=7;r.register(g,'enemy','a');assert.equal(r.register(g,'enemy','b'),false);const ground=r.place(g,-100,1600)!;
 assert.equal(ground.previousOwner,'enemy');assert.equal(ground.chunk,'-1,1');assert.equal(r.place(g,0,0),undefined);
 assert.equal(r.take(ground,'player'),g);assert.equal(r.take(ground,'enemy'),undefined);assert.equal(ground.available,false);
 assert.equal(r.register({...g},'player'),false);assert.ok(r.fly(g));assert.equal(r.records.get(g.instanceId!)!.owner,'flying');
 const landed=r.place(g,0,0)!;const saved=JSON.parse(JSON.stringify(g));assert.ok(r.sleep(landed));assert.equal(r.records.size,0);
 const restored=r.place(saved,0,0)!;assert.equal(restored.instanceId,g.instanceId);assert.equal(restored.ammo,2);assert.equal(restored.reserve,7);
 r.clear();assert.equal(restored.available,false);assert.equal(r.records.size,0);
});
test('las dieciséis armas aceptan modificadores pertinentes; melee no recarga ni necesita munición',()=>{
 const stats=baseStats();stats.fireRate=.4;stats.magazine=.5;stats.damage=1.3;stats.meleeDamage=.2;
 for(let id=0;id<16;id++){const w=WEAPONS[id],g=gun(id);assert.ok(fireInterval(id,stats)>0);assert.ok(playerDamage(w.damage,stats,40,isMelee(id))>=w.damage);if(isMelee(id)){assert.equal(g.ammo,0);assert.equal(magazineCapacity(id,stats),0);assert.equal(reload(g),0)}else{assert.ok(magazineCapacity(id,stats)>=w.mag);g.ammo=0;assert.equal(reload(g),Math.min(w.mag,w.reserve))}}
 assert.equal(WEAPONS[10].damage*WEAPONS[10].pellets,70);assert.equal(WEAPONS[11].damage,90);assert.equal(WEAPONS[12].mag,100);
});
test('quemadura no apila temporizadores, dura un segundo y no repite crédito de impacto',()=>{
 const u=new Ultimate(),e={hp:100,sprite:{active:true}},s={clock:0,ended:false,hit:(enemy:typeof e,n:number,attack:any)=>{enemy.hp-=n;u.hit(enemy,attack,s.clock)},damage:()=>{}};
 const b=new Burning(s as any),shot=u.shot(0);u.hit(e,shot,0);b.ignite(e as any,shot);s.clock=100;b.ignite(e as any,shot);s.clock=1000;b.update();assert.equal(e.hp,92);assert.equal(u.charge,1);s.clock=1100;b.update();s.clock=5000;b.update();assert.equal(e.hp,92);b.stop();
});
test('recursos normalizados de las ocho armas nuevas e iconos/uso/sonidos locales',()=>{
 for(let id=8;id<16;id++){for(const name of [`assets/weapons/weapon-${id}.png`,...['pickup','hud','fire-0','fire-1'].map(role=>`assets/weapons/second/${id}-${role}.png`)]){const p=readFileSync(`public/${name}`);assert.equal(p.readUInt32BE(16),32);assert.equal(p.readUInt32BE(20),32)}}
 for(const name of ['uzi','magnum','sawedoff','m79','flame','bat','crowbar','axe'])assert.equal(readFileSync(`public/assets/audio/${name}.wav`).toString('ascii',0,4),'RIFF');
});
