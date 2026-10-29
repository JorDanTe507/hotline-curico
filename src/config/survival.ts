// V0.4 balance knobs. Boss speed and attack patterns retain their previous values.
export const NORMAL_ENEMY_SPEED_MULTIPLIER=1.2;
export const BOSS_SPEED_MULTIPLIER=1;
export const WEAPON_DETECTION_RADIUS=160;
export const ENEMY_EXECUTION_CHANCE=.2;
export const ENEMY_EXECUTION_RANGE=48;
export const ENEMY_EXECUTION_PREPARE=500;
export const ENEMY_EXECUTION_COOLDOWN=5000;
export const STUN_DURATION=1500;
export const THROW_SPEED=620;
export const THROW_RANGE=360;
export const PLAYER_EXECUTION_RANGE=40;
export const PLAYER_EXECUTION_DURATION=500;
export const CRITICAL_HEALTH=25;
export const CRITICAL_ALERT_INTERVAL=1200;
export function enemyMovementSpeed(base:number,boss:boolean){return base*(boss?BOSS_SPEED_MULTIPLIER:NORMAL_ENEMY_SPEED_MULTIPLIER)}
