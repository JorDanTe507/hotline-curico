/** All timestamps use the paused simulation clock, in milliseconds. */
export const RESCUE_MS = 3000;
export class ContinuousRescue {
  falls = 0;
  recoveredAt = 0;
  sampledAt = 0;

  deadline(now:number) {
    if (now - this.recoveredAt >= 300000) this.falls = 0;
    this.sampledAt = now;
    return now + [45000,35000,25000,20000][Math.min(this.falls++,3)];
  }

  advance(state:{until:number;progress:number;dead:boolean}, now:number, held:boolean) {
    if (!state.until || state.dead) return;
    const delta = Math.max(0,now-this.sampledAt);
    this.sampledAt = now;
    if (now >= state.until) {
      state.dead = true;
      state.until = state.progress = 0;
      return 'expired';
    }
    state.progress = Math.max(0,state.progress + delta*(held?1:-RESCUE_MS*.25/1000));
    if (RESCUE_MS - state.progress > 1e-7) return;
    state.until = state.progress = 0;
    this.recoveredAt = now;
    return 'revived';
  }
}
