import {test} from 'node:test';
import assert from 'node:assert/strict';
import {RequiemPenetration,REQUIEM_PENETRATION_MULTIPLIERS,segmentTargetDistance} from '../src/weapons/RequiemPenetration';
import {RequiemRoundChallenge} from '../src/systems/RequiemRoundChallenge';
import {AchievementService,ACHIEVEMENTS,ACHIEVEMENT_KEY} from '../src/systems/Achievements';

test('cuatro objetivos distintos: 100/85/70/55, no acumula reducciones ni repite al jefe',()=>{
 const p=new RequiemPenetration(),boss={};assert.equal(p.hit(boss),1);assert.equal(p.hit(boss),undefined);
 assert.deepEqual([p.hit({}),p.hit({}),p.hit({})],[.85,.7,.55]);assert.equal(p.hit({}),undefined);assert.ok(p.exhausted);assert.equal(p.hits,4);
 assert.deepEqual(REQUIEM_PENETRATION_MULTIPLIERS.map(n=>90*n),[90,76.5,62.99999999999999,49.50000000000001]);
});
test('contadores independientes, configurables y referencias compartidas no mezclan proyectiles',()=>{
 const a=new RequiemPenetration(),b=new RequiemPenetration(),e={};assert.equal(a.hit(e),1);assert.equal(b.hit(e),1);assert.equal(a.hit({}),.85);assert.equal(b.hits,1);
 const c=new RequiemPenetration([1,.5]);assert.equal(c.hit({}),1);assert.equal(c.hit({}),.5);assert.ok(c.exhausted);
});
test('barrido detecta objetivos entre fotogramas, ordena distancias y rechaza fuera de trayectoria',()=>{
 const a={x:0,y:0},b={x:500,y:0};assert.equal(segmentTargetDistance(a,b,{x:200,y:0},22),200);assert.equal(segmentTargetDistance(a,b,{x:100,y:23},22),undefined);
 assert.equal(segmentTargetDistance(a,a,{x:0,y:1},22),0);assert.equal(segmentTargetDistance(a,b,{x:550,y:0},22),undefined);
});

function setup(weapon:number|undefined=9,round=1,ordered=true,disabled=()=>false){const c=new RequiemRoundChallenge(disabled);c.begin(round,weapon,ordered);return c}
function killRound(c:RequiemRoundChallenge,round=1){for(let i=0;i<15;i++){const e={},token={};c.spawn(e,round);c.offensive('shot',9,token);const credit={weaponId:9,method:'shot',fromPlayer:true,achievementToken:token};c.damage(e,credit);c.killed(e,credit)}c.tick(16)}

test('exclusiva solo concede al completar, con enemigos reales y ataques registrados; no duplica',()=>{
 const c=setup();killRound(c);assert.ok(c.complete(1,true));assert.equal(c.complete(1,true),false);
 assert.equal(setup().complete(1,true),false);const artificial=setup();artificial.spawn({},1);artificial.offensive('shot',9,{});artificial.tick(16);assert.equal(artificial.complete(1,true),false);
});
test('empezar con otra arma o sin arma no se arregla al terminar con Requiem',()=>{
 for(const id of [undefined,0,1,3]){const c=setup(id===undefined?-1:id);killRound(c);assert.equal(c.complete(1,true),false)}
});
test('un solo disparo ajeno, incluso fallado, invalida irrevocablemente',()=>{
 const c=setup();c.offensive('shot',0,{});killRound(c);assert.equal(c.complete(1,true),false);
});
test('Calada con dos Requiem válida, mezcla con escopeta inválida; activar ulti no es un ataque',()=>{
 const dual=setup();dual.offensive('shot',9,{});dual.offensive('shot',9,{});killRound(dual);assert.ok(dual.complete(1,true));
 const mixed=setup();mixed.offensive('shot',9,{});mixed.offensive('shot',3,{});killRound(mixed);assert.equal(mixed.complete(1,true),false);
});
test('curación/dash/recarga no se registran como ofensiva; melee, ejecución, lanzamiento y explosión invalidan',()=>{
 const clean=setup();clean.tick(1000);killRound(clean);assert.ok(clean.complete(1,true));
 for(const action of ['melee','execute','throw','explosion']){const c=setup();c.offensive(action,9);killRound(c);assert.equal(c.complete(1,true),false)}
});
test('daño secundario o no registrado invalida aunque conserve weaponId 9',()=>{
 for(const secondary of [false,true]){const c=setup(),e={},token={};c.spawn(e,1);if(secondary)c.offensive('shot',9,token);c.damage(e,{weaponId:9,method:'shot',fromPlayer:true,secondary,achievementToken:token});killRound(c);assert.equal(c.complete(1,true),false)}
});
test('desarrollador en cualquier parte, salto de ronda, derrota o cancelación nunca conceden',()=>{
 let developer=false;const c=setup(9,1,true,()=>developer);killRound(c);developer=true;c.tick(1);developer=false;assert.equal(c.complete(1,true),false);
 const skipped=setup(9,1,false);killRound(skipped);assert.equal(skipped.complete(1,true),false);
 const dead=setup();killRound(dead);assert.equal(dead.complete(1,false),false);
 const stopped=setup();killRound(stopped);stopped.cancel();assert.equal(stopped.complete(1,true),false);
});
test('supervivencia sin mínimo de bajas: combate real observado completo; saltar reloj no basta',()=>{
 const c=setup(9,2),e={};c.spawn(e,2);c.offensive('shot',9,{});c.tick(90000);assert.ok(c.complete(2,true));
 const short=setup(9,2);short.spawn({},2);short.offensive('shot',9,{});short.tick(16);assert.equal(short.complete(2,true),false);
 const idle=setup(9,2);idle.spawn({},2);idle.tick(90000);assert.equal(idle.complete(2,true),false);
});
test('no exige bajas personales: daño de enemigos a otros enemigos no es una ofensiva del jugador',()=>{
 const c=setup(),token={};c.offensive('shot',9,token);
 for(let i=0;i<15;i++){const e={};c.spawn(e,1);c.killed(e,i?{fromPlayer:false,weaponId:6,method:'shot'}:{fromPlayer:true,weaponId:9,method:'shot',achievementToken:token})}
 c.tick(16);assert.ok(c.complete(1,true));
});
test('logro 41 legendario, quote exacta, icono propio y guardado anterior conservado',()=>{
 assert.equal(ACHIEVEMENTS.length,41);const def=ACHIEVEMENTS.at(-1)!;assert.equal(def.id,'requiem-round');assert.equal(def.name,'Salud para los vivos, Requiem para los muertos');assert.equal(def.description,'Completa una ronda de combate utilizando exclusivamente la Requiem.');assert.equal(def.rarity,'legendary');assert.equal(def.icon,12);
 let saved=JSON.stringify({version:1,kills:507,unlocked:{kill:'2026-10-28T12:00:00.000Z'},progress:{},rerolls:{cervela:2,nicolas:1}});
 const storage={getItem:()=>saved,setItem:(k:string,v:string)=>{assert.equal(k,ACHIEVEMENT_KEY);saved=v}},a=new AchievementService(storage,()=>false);
 a.event({type:'start'});a.event({type:'roundComplete'});assert.ok(!a.data.unlocked['requiem-round']);a.event({type:'requiemRoundComplete'});a.event({type:'requiemRoundComplete'});
 assert.equal(a.notifications.filter(n=>n.id===def.id).length,1);const b=new AchievementService(storage,()=>false);assert.ok(b.data.unlocked[def.id]);assert.equal(b.data.kills,507);assert.equal(b.data.unlocked.kill,'2026-10-28T12:00:00.000Z');assert.equal(b.data.rerolls.cervela,2);
 const blocked=new AchievementService(storage,()=>true);assert.equal(blocked.event({type:'requiemRoundComplete'}),false);
});
