import type { DateValue } from "@internationalized/date";

export interface Event {
  name: string;
  type: string;
  eventDate: string;
  point: number;
  status: string;
  processingInfo?: {
    startedAt: string | null;
    completedAt: string | null;
    jobID: string | null;
    processedCount: number;
    failedCount: number;
    totalCustomers: number;
    error: string | null;
  };
  isImmediate: boolean;
  _id?: string;
}

export interface WaysToEarnSettings {
  signUp: {
    enabled: boolean;
    points: string;
  };
  everyPurchase: {
    enabled: boolean;
    points: string;
  };
  birthday: {
    enabled: boolean;
    points: string;
  };
  referEarn: {
    enabled: boolean;
    points: string;
  };
  profileCompletion: {
    enabled: boolean;
    points: string;
  };
  newsletter: {
    enabled: boolean;
    points: string;
  };
  events: {
    enabled: boolean;
    events: Event[];
  };
  rejoin: {
    enabled: boolean;
    recallDays: string;
    points: string;
  };
}

export interface EventFormData {
  name: string;
  date: DateValue | null;
  points: string;
}

