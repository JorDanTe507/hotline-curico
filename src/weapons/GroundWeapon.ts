import type {Gun} from './arsenal';
export type WeaponOwner='player'|'enemy'|'ground'|'flying';
export class GroundWeapon {
 available=true;
 constructor(readonly weapon:Gun,public x:number,public y:number,readonly previousOwner:WeaponOwner,readonly chunk:string){}
 get instanceId(){return this.weapon.instanceId!}
 get type(){return this.weapon.id}
 get ammo(){return this.weapon.ammo}
 get reserve(){return this.weapon.reserve}
}
interface Record {weapon:Gun;owner:WeaponOwner;ownerId?:string;ground?:GroundWeapon}
/** One canonical weapon per live instance. Sleeping weapons are serialized outside this map. */
export class WeaponInstances {
 readonly records=new Map<string,Record>();private sequence=0;
 constructor(private prefix:string){}
 register(weapon:Gun,owner:WeaponOwner,ownerId?:string){
  weapon.instanceId??=`${this.prefix}-${++this.sequence}`;
  const existing=this.records.get(weapon.instanceId);if(existing){if(existing.weapon!==weapon||existing.owner!==owner||(ownerId!==undefined&&existing.ownerId!==undefined&&existing.ownerId!==ownerId))return false;existing.ownerId??=ownerId;return true}
  this.records.set(weapon.instanceId,{weapon,owner,ownerId});return true;
 }
 place(weapon:Gun,x:number,y:number){
  weapon.instanceId??=`${this.prefix}-${++this.sequence}`;const record=this.records.get(weapon.instanceId);
  if(record&&record.weapon!==weapon)return undefined;if(record?.owner==='ground')return undefined;
  const ground=new GroundWeapon(weapon,x,y,record?.owner??'ground',`${Math.floor(x/1536)},${Math.floor(y/1536)}`);
  this.records.set(weapon.instanceId,{weapon,owner:'ground',ground});return ground;
 }
 take(ground:GroundWeapon,owner:'player'|'enemy',ownerId?:string){const record=this.records.get(ground.instanceId);if(!record||record.owner!=='ground'||record.ground!==ground||!ground.available)return undefined;ground.available=false;record.owner=owner;record.ownerId=ownerId;record.ground=undefined;return record.weapon}
 fly(weapon:Gun){if(!this.register(weapon,'player'))return false;const record=this.records.get(weapon.instanceId!)!;record.owner='flying';return true}
 retire(weapon:Gun,owner?:WeaponOwner){const record=this.records.get(weapon.instanceId??'');if(record&&(!owner||record.owner===owner)){if(record.ground)record.ground.available=false;this.records.delete(weapon.instanceId!)}}
 sleep(ground:GroundWeapon){const record=this.records.get(ground.instanceId);if(record?.ground!==ground||record.owner!=='ground')return false;ground.available=false;this.records.delete(ground.instanceId);return true}
 clear(){for(const record of this.records.values())if(record.ground)record.ground.available=false;this.records.clear()}
}
