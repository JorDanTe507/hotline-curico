export const BUILDING_TEMPLATES=[
 {id:'hotel',name:'HOTEL',facade:0,material:'wood',wall:'wall',rooms:['Recepción','Individual','Doble','Baño','Estar','Servicio','Deteriorada','Cerrada'],furniture:['desk','bed','wardrobe','sofa','nightstand','washer']},
 {id:'bank',name:'BANCO DE CURICÓ',facade:1,material:'checker',wall:'steel',rooms:['Vestíbulo','Cajas','Oficinas','Espera','Pasillo','Bóveda'],furniture:['counter','desk','sofa','machine','shelves','crate']},
 {id:'pharmacy',name:'FARMACIA +',facade:2,material:'ceramic',wall:'wall',rooms:['Ventas','Mostrador','Medicamentos','Bodega','Consultorio','Baño'],furniture:['shelves','counter','shelves','crate','bed','washer']},
 {id:'police',name:'CARABINEROS DE CHILE',facade:3,material:'blue',wall:'steel',rooms:['Recepción','Oficinas','Espera','Interrogatorio','Celdas','Pasillo'],furniture:['desk','desk','sofa','table','wardrobe','shelves']},
 {id:'supermarket',name:'SUPERMERCADO',facade:4,material:'ceramic',wall:'brick',rooms:['Ventas','Cajas','Productos','Cámara fría','Bodega','Oficina'],furniture:['shelves','counter','shelves','machine','crate','desk']},
 {id:'workshop',name:'TALLER MECÁNICO',facade:5,material:'industrial',wall:'steel',rooms:['Reparación','Herramientas','Elevadores','Almacén','Oficina','Baño'],furniture:['machine','shelves','car','tires','desk','washer']},
 {id:'restaurant',name:'FUENTE DE SODA',facade:6,material:'red',wall:'brick',rooms:['Salón','Mostrador','Mesas','Cocina','Bodega','Baño'],furniture:['table','counter','table','machine','crate','washer']},
 {id:'convenience',name:'PRONTO · 24 HORAS',facade:7,material:'checker',wall:'wall',rooms:['Ventas','Caja','Refrigeradores','Productos','Bodega','Servicio'],furniture:['shelves','counter','machine','shelves','crate','washer']}
] as const;
export type BuildingType=typeof BUILDING_TEMPLATES[number]['id'];
export const positiveMod=(n:number,d:number)=>(n%d+d)%d;
export function templateFor(seed:number,cx:number,cy:number,q:number,biome:string){const pool=biome==='residential'?[0,7,2,6]:biome==='industrial'?[5,4,1,7]:[0,1,2,3,4,5,6,7];return BUILDING_TEMPLATES[pool[positiveMod(seed+cx*2+q%2+(cy*2+Math.floor(q/2))*3,pool.length)]]}
