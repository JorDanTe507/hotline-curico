import type {Game} from '../scenes/Game';
import type Phaser from 'phaser';
import {characterById} from '../characters/catalog';
import {playerInput} from '../input/InputHub';
import type {SafeLine} from './dialogues';

export class SafeConversation {
  private panel?: Phaser.GameObjects.Container;
  private name?: Phaser.GameObjects.Text;
  private body?: Phaser.GameObjects.Text;
  private portrait?: Phaser.GameObjects.Image;
  private index = 0;
  private closed=false;

  constructor(private s: Game, private npc: Phaser.GameObjects.Sprite, private lines: readonly SafeLine[],private complete?:()=>void) {
    s.player.setVelocity(0);
    s.physics.world.pause();
    npc.anims.pause();
    if (!s.registry.get('mobileUI')) {
      const bg = s.add.rectangle(640, 587, 860, 172, 0x140a21, .97).setStrokeStyle(2, 0xea3985);
      this.portrait = s.add.image(283, 587, characterById(lines[0][0]).portrait);
      this.name = s.add.text(354, 518, '', {fontFamily:'monospace', fontSize:21,color:'#ff75b5'});
      this.body = s.add.text(354, 553, '', {fontFamily:'monospace', fontSize:21,color:'#f8e9f4',wordWrap:{width:684}});
      const help = s.add.text(354, 640, 'E / × CONTINUAR  ·  ESC / ○ CERRAR', {fontFamily:'monospace',fontSize:14,color:'#7ae8ed'});
      this.panel = s.add.container(0,0,[bg,this.portrait,this.name,this.body,help]).setScrollFactor(0).setDepth(140);
    }
    this.render();
  }

  get line() { return this.lines[this.index]; }
  private render() {
    if (!this.panel) return;
    const character = characterById(this.line[0]);
    this.name!.setText(character.name);
    this.body!.setText(this.line[1]);
    const portrait = this.portrait!.setTexture(character.portrait);
    portrait.setScale(Math.min(105 / portrait.width, 126 / portrait.height));
  }

  advance() {
    if(this.closed)return;
    if (this.index + 1 === this.lines.length) {this.close();this.complete?.();}
    else { this.index++; this.render(); }
  }

  close() {
    if(this.closed)return;
    this.closed=true;
    this.panel?.destroy(true);
    this.npc.anims.resume();
    this.s.physics.world.resume();
    const hub = playerInput(this.s);
    hub.pressed.clear();
    hub.touch.clear();
    this.s.blockPointerUntilRelease = true;
    this.s.rush!.conversation = undefined;
  }
}
