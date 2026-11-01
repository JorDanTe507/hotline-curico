/** Presentation only: no changes to perception, damage, collisions or event duration. */
export const ATMOSPHERE={blackoutShade:.62,blackoutElectrical:.18,rainGain:.26,rainOpacity:.46,fogGround:.48,fogActors:.16};
export function approach(current:number,target:number,delta:number,milliseconds=1800){return target+(current-target)*Math.exp(-Math.max(0,delta)/milliseconds)}
export function poweredTint(base:number,power:number){return (Math.round(((base>>16)&255)*power)<<16)|(Math.round(((base>>8)&255)*power)<<8)|Math.round((base&255)*power)}
export const electricallyPowered=(frame:string)=>/^(facade-|v17-(copec-(facade|canopy|pump|sign|fridge)|alley-lamp|warehouse-lamp)|hotel$|vending$|exit$|lamp$|trafficlight$|phone$)/.test(frame);
