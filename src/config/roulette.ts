/** All sixteen entries are functional; weights sum to 100. */
export const ROULETTE_WEIGHTS=[
 {key:'pistol',id:0,weight:18},{key:'revolver',id:1,weight:13},
 {key:'smg',id:2,weight:12},{key:'shotgun',id:3,weight:11},
 {key:'assault',id:4,weight:9},{key:'sniper',id:5,weight:5},
 {key:'mini-uzi',id:8,weight:9},{key:'magnum',id:9,weight:7},
 {key:'sawed-off',id:10,weight:6},{key:'m79',id:11,weight:3},
 {key:'flamethrower',id:12,weight:3},{key:'rpg',id:6,weight:1},
 {key:'minigun',id:7,weight:1},{key:'bat',id:13,weight:.7},
 {key:'crowbar',id:14,weight:.7},{key:'axe',id:15,weight:.6},
] as const;
export const ROULETTE_SPIN_MS=2800;
export const ROULETTE_TOTAL_MS=3600;
export const NORMAL_MINIGUN_CHANCE=.01;
