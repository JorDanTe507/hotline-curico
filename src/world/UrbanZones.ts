export type ZoneKind='parking'|'warehouse'|'alley'|'copec';
export interface UrbanZone {kind:ZoneKind;x:number;y:number;w:number;h:number}
export const ZONE_NAMES:Record<ZoneKind,string>={parking:'ESTACIONAMIENTO',warehouse:'BODEGA INDUSTRIAL',alley:'CALLEJÓN',copec:'COPEC · MINIMARKET'};
export function zoneChoice(n:number):ZoneKind|undefined{return n%10<4?(['parking','warehouse','alley','copec'] as const)[n%10]:undefined}
