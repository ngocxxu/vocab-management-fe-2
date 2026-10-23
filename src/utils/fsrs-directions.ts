import { EFsrsDirection } from '@/enum/vocab-trainer';

/**
 * The directions after one of them is picked or unpicked. Random stands alone: picking it clears Recognise and Recall,
 * picking either of those clears Random. The last selected direction cannot be unpicked, because a trainer without one
 * would have no cards.
 */
/** Random is a choice of its own: it cannot be saved together with Recognise or Recall. */
export function isRandomWithOthers(directions: EFsrsDirection[]): boolean {
  return directions.includes(EFsrsDirection.RANDOM) && directions.length > 1;
}

export function toggleDirection(current: EFsrsDirection[], direction: EFsrsDirection): EFsrsDirection[] {
  if (current.includes(direction)) {
    const next = current.filter(item => item !== direction);

    return next.length === 0 ? current : next;
  }

  if (direction === EFsrsDirection.RANDOM) {
    return [EFsrsDirection.RANDOM];
  }

  return [...current.filter(item => item !== EFsrsDirection.RANDOM), direction];
}
