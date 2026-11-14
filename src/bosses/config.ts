export const BOSSES=['Escopeta pesada','Ametralladora','Lanzagranadas','Rifle de alto calibre','Martillo contundente','Wesker'];
export const bossIndex=(round:number)=>round%5===0?((round/5-1)%6):-1;
