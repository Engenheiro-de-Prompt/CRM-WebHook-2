
import { Status, Priority } from './types';

export const STATUSES: Status[] = [Status.ToDo, Status.InProgress, Status.Done];
export const PRIORITIES: Priority[] = [Priority.Low, Priority.Medium, Priority.High, Priority.Urgent];

export const PRIORITY_COLORS: { [key in Priority]: string } = {
  [Priority.Low]: 'bg-green-500',
  [Priority.Medium]: 'bg-yellow-500',
  [Priority.High]: 'bg-orange-500',
  [Priority.Urgent]: 'bg-red-600',
};
