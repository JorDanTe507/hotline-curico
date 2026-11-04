import type Phaser from 'phaser';
import {poweredTint} from './AtmosphereStyle';
type Sprite=Phaser.GameObjects.Sprite;
/** Render-only multiplication: combat tints/animation code never see altered colors. */
export class ActorLighting {
 private saved=new Map<Sprite,{colors:[number,number,number,number];fill:boolean}>();
 apply(sprites:Sprite[],power=.75){this.restore();for(const sprite of sprites){if(!sprite.active)continue;const colors:[number,number,number,number]=[sprite.tintTopLeft,sprite.tintTopRight,sprite.tintBottomLeft,sprite.tintBottomRight];this.saved.set(sprite,{colors,fill:sprite.tintFill});const dim=colors.map(c=>poweredTint(c,power)) as typeof colors;if(sprite.tintFill)sprite.setTintFill(...dim);else sprite.setTint(...dim)}}
 restore(){for(const [sprite,{colors,fill}] of this.saved)if(sprite.active){if(fill)sprite.setTintFill(...colors);else sprite.setTint(...colors)}this.saved.clear()}
}
