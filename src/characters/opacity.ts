/** Normalize actor interiors while retaining transparent backgrounds and soft edge/effect pixels. */
export function opaqueActorBody(data:Uint8ClampedArray){for(let k=3;k<data.length;k+=4)if(data[k]>=128)data[k]=255}
