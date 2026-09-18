// Millisecond Precision Response Timer & Telemetry Recorder

export class TelemetryEngine {
  constructor() {
    this.startTime = null;
    this.hazardRecTime = null;
    this.actionLogs = [];
    this.mistakes = [];
  }

  start() {
    this.startTime = performance.now();
    this.hazardRecTime = null;
    this.actionLogs = [];
    this.mistakes = [];
    console.log('[Telemetry] Session started at timestamp 0ms');
  }

  recordHazardRecognition() {
    if (this.hazardRecTime !== null) return this.hazardRecTime;
    this.hazardRecTime = performance.now() - this.startTime;
    this.logAction('HAZARD_RECOGNIZED', { elapsed_ms: Math.round(this.hazardRecTime) });
    return Math.round(this.hazardRecTime);
  }

  logAction(actionName, details = {}) {
    const elapsed = this.startTime ? Math.round(performance.now() - this.startTime) : 0;
    this.actionLogs.push({
      action: actionName,
      elapsed_ms: elapsed,
      ...details
    });
  }

  recordMistake(mistakeDesc) {
    this.mistakes.push(mistakeDesc);
    this.logAction('SAFETY_MISTAKE', { mistake: mistakeDesc });
  }

  finish() {
    const totalDuration = this.startTime ? Math.round(performance.now() - this.startTime) : 0;
    const hazardRecMs = this.hazardRecTime !== null ? Math.round(this.hazardRecTime) : totalDuration;

    return {
      duration_ms: totalDuration,
      hazard_rec_ms: hazardRecMs,
      action_logs: this.actionLogs,
      mistakes: this.mistakes
    };
  }
}
