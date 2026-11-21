import type {PermanentProgress} from '../systems/PermanentProgress';
import type {PermanentCharacter} from '../config/permanent';
/** A single session wallet backed by existing personal accounts; no copies of money. */
export class SessionWallet {
 private turn=0;private debit?:{id:PermanentCharacter;amount:number}[];
 constructor(private progress:PermanentProgress,readonly owners:PermanentCharacter[]) {if(!owners.length||new Set(owners).size!==owners.length)throw Error('Wallet owners must be distinct')}
 get balance(){return this.owners.reduce((sum,id)=>sum+this.progress.balance(id),0)}
 credit(amount:number){if(!Number.isSafeInteger(amount)||amount<=0||this.balance>Number.MAX_SAFE_INTEGER-amount)return 0;const entries=this.owners.map((id,i)=>({id,amount:Math.floor(amount/this.owners.length)+(i===(this.turn%this.owners.length)?amount%this.owners.length:0)}));this.turn++;this.progress.transact(entries);return amount}
 spend(amount:number){if(!Number.isSafeInteger(amount)||amount<=0||this.balance<amount)return false;let remaining=amount;const entries=this.owners.map(id=>{const n=Math.min(remaining,this.progress.balance(id));remaining-=n;return {id,amount:-n}});const ok=this.progress.transact(entries);if(ok)this.debit=entries;return ok}
 refund(amount:number){if(!this.debit||-this.debit.reduce((n,e)=>n+e.amount,0)!==amount)return false;const ok=this.progress.transact(this.debit.map(e=>({...e,amount:-e.amount})));if(ok)this.debit=undefined;return ok}
}
