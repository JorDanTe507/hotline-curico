/** Page-lifetime only: never serialize this object or credentials. */
export const developerSession={active:false,immortal:true,round:1,unlock(password:string){if(password!=='PROJECT507')return false;this.active=true;return true}};
