export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp?: Date
}

export interface IAnalyticsService {
  track(event: AnalyticsEvent): void
}
