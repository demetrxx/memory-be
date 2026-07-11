export class TimeTracker {
  private _startTime: number;
  private _endTime: number;
  private _duration: number;
  private _laps: number[] = [];

  constructor() {
    this._startTime = Date.now();
    this._laps.push(0);
  }

  finish() {
    this._endTime = Date.now();
    this._duration = this._endTime - this._startTime;
    return this._duration;
  }

  track() {
    const now = Date.now();
    const duration = now - this._startTime;
    return duration;
  }

  lap() {
    const now = Date.now();
    const lapDuration = now - this._laps[this._laps.length - 1];
    this._laps.push(lapDuration);
    return lapDuration;
  }

  get duration() {
    return this._duration;
  }
}
