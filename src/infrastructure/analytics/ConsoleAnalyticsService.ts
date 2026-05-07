import type { IAnalyticsService, AnalyticsEvent } from '@application/ports/outbound/IAnalyticsService'

export class ConsoleAnalyticsService implements IAnalyticsService {
  track(event: AnalyticsEvent): void {
    console.log(`[Analytics] ${event.name}`, event.properties ?? '', event.timestamp ?? new Date())
  }
}
