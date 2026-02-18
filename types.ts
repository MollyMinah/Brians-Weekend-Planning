
export enum RSVPStatus {
  YES = 'YES',
  NO = 'NO',
  MAYBE = 'MAYBE'
}

export enum GuestCategory {
  ADULT = 'Adult',
  TEEN_TWEEN = 'Teen or Tween',
  CHILD = 'Child',
  BABY = 'Baby',
  DOG = 'Dog'
}

export interface GuestMember {
  id: string;
  name: string;
  category: GuestCategory;
}

export interface RSVPGroup {
  id: string;
  contactName: string;
  email: string;
  status: RSVPStatus;
  likelihood?: number; // % chance of coming (0-100)
  members: GuestMember[];
  prefersQuiet: boolean;
  prefersNoPaws: boolean;
  notes: string;
  submittedAt: number;
}

export interface SleepingUnit {
  id: string;
  name: string;
  beds: string[];
  capacity: number;
  isHostRoom: boolean;
}

export interface RoomAssignment {
  roomId: string;
  groupId: string;
}
