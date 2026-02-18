
import { SleepingUnit } from './types';

export const HOUSE_UNITS: SleepingUnit[] = [
  {
    id: 'room-1',
    name: 'Bedroom 1 (Master)',
    beds: ['King'],
    capacity: 2,
    isHostRoom: false
  },
  {
    id: 'room-2',
    name: 'Bedroom 2',
    beds: ['King'],
    capacity: 2,
    isHostRoom: true
  },
  {
    id: 'room-3',
    name: 'Bedroom 3',
    beds: ['King', 'Double'],
    capacity: 4,
    isHostRoom: false
  },
  {
    id: 'room-4',
    name: 'Bedroom 4',
    beds: ['King', 'Twin'],
    capacity: 3,
    isHostRoom: false
  },
  {
    id: 'room-5',
    name: 'Bedroom 5',
    beds: ['King', 'Twin'],
    capacity: 3,
    isHostRoom: false
  },
  {
    id: 'unit-6',
    name: 'Garage / Flexible',
    beds: ['Air Mattress'],
    capacity: 2,
    isHostRoom: false
  },
  {
    id: 'unit-7',
    name: 'Common Area',
    beds: ['Cot'],
    capacity: 1,
    isHostRoom: false
  }
];

export const TOTAL_CAPACITY = 17;
