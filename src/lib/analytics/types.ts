export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface ClientTrackingEvent {
  eventName: string;
  pagePath: string;
  pageUrl?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  visitorId?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
}
