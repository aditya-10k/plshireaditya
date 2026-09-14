import { API_BASE } from '../config/api';

export type BackendStatus = 'checking' | 'online' | 'waking' | 'offline';

export interface HealthState {
  status: BackendStatus;
  latencyMs: number | null;
  lastChecked: Date | null;
  serviceName?: string;
  uptimeSeconds?: number;
  projectsCount?: number;
  apiUrl: string;
}

class HealthService {
  private listeners: Set<(state: HealthState) => void> = new Set();
  private state: HealthState = {
    status: 'checking',
    latencyMs: null,
    lastChecked: null,
    apiUrl: API_BASE,
  };
  private pollTimer: any = null;
  private consecutiveFailures: number = 0;
  private isChecking: boolean = false;

  constructor() {
    this.checkHealth();
    this.scheduleNextPoll();
  }

  public subscribe(fn: (state: HealthState) => void): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  public getState(): HealthState {
    return this.state;
  }

  private scheduleNextPoll() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    // Fast poll when waking (every 4s) to catch wake-up immediately.
    // Standard poll when online (every 25s).
    // Moderate poll when offline/checking (every 12s).
    let delay = 25000;
    if (this.state.status === 'waking') {
      delay = 4000;
    } else if (this.state.status === 'checking' || this.state.status === 'offline') {
      delay = 12000;
    }

    this.pollTimer = setTimeout(async () => {
      await this.checkHealth();
      this.scheduleNextPoll();
    }, delay);
  }

  public async checkHealth(): Promise<HealthState> {
    if (this.isChecking) return this.state;
    this.isChecking = true;

    const start = performance.now();
    const controller = new AbortController();
    // Cold start on Render can take up to 12s on individual HTTP ping
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json();
        this.consecutiveFailures = 0;
        this.state = {
          status: 'online',
          latencyMs: latency,
          lastChecked: new Date(),
          serviceName: data.service || 'persona-agent-api',
          uptimeSeconds: data.uptime_seconds,
          projectsCount: data.projects_count,
          apiUrl: API_BASE,
        };
      } else {
        this.consecutiveFailures++;
        this.state = {
          status: this.consecutiveFailures >= 3 ? 'offline' : 'waking',
          latencyMs: null,
          lastChecked: new Date(),
          apiUrl: API_BASE,
        };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      this.consecutiveFailures++;
      // First 1-2 timeouts/network errors indicate Render instance is warming up
      this.state = {
        status: this.consecutiveFailures >= 3 ? 'offline' : 'waking',
        latencyMs: null,
        lastChecked: new Date(),
        apiUrl: API_BASE,
      };
    } finally {
      this.isChecking = false;
      this.notify();
    }

    return this.state;
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.state));
  }
}

export const healthService = new HealthService();
