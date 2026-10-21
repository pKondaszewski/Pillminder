export type SkyPhase = 'dawn' | 'day' | 'dusk' | 'night';

export type SkyKey = SkyPhase | 'done' | 'doneNight';

export type SceneMood = 'calm' | 'overdue' | 'done';

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

export interface SkyScene {
  phase: SkyPhase;
  body: 'sun' | 'moon';
  progress: number;
}

export interface BodyPosition {
  x: number;
  elevation: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  cycles: number;
  offset: number;
}
