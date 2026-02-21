export type EventStatus = "upcoming" | "live" | "ended" | "finalized";

export type AttendanceStatus =
  | "none"
  | "arrived"
  | "leaving"
  | "confirmed"
  | "rejected";

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryMultiplier: number;
  date: string;
  time: string;
  endTime: string;
  location: string;
  image: string;
  baseReward: number;
  status: EventStatus;
  duration: number;
  minAttendance: number;
  maxRewardDuration: number;
  attendees: number;
  maxParticipants: number;
  attendanceStatus?: AttendanceStatus;
  arrivedAt?: string;
  checkInTime?: number;
}

export interface Activity {
  id: string;
  eventName: string;
  date: string;
  azist: number;
  xp: number;
  status: string;
  txHash: string;
  type: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  image: string;
  azistCost: number;
  status: "available" | "insufficient" | "sold-out";
  expirationDate: string;
  code?: string;
}

export interface UserStats {
  azistBalance: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  levelMultiplier: number;
  streak: number;
  streakMultiplier: number;
}

export interface Objective {
  id: string;
  title: string;
  progress: number;
  total: number;
}

export const AREA_NAMES = [
  "Medioambiental",
  "Comunitario",
  "Educacion",
  "Salud",
  "Cultural",
] as const;

export const AREA_IMAGES: Record<string, string> = {
  Medioambiental: "/placeholder.svg",
  Comunitario: "/placeholder.svg",
  Educacion: "/placeholder.svg",
  Salud: "/placeholder.svg",
  Cultural: "/placeholder.svg",
};

export const EPOCH_STATE_MAP: Record<number, EventStatus> = {
  0: "upcoming",
  1: "live",
  2: "ended",
  3: "finalized",
};

export const PRESENCE_STATE_MAP: Record<number, AttendanceStatus> = {
  0: "none",
  1: "arrived",
  2: "leaving",
  3: "confirmed",
  4: "rejected",
};
