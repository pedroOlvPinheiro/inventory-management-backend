import { PoliticalTag } from '@prisma/client';

const TAG_ORDER: PoliticalTag[] = [
  PoliticalTag.PAULO_CASE,
  PoliticalTag.PEDRO_LUCAS,
  PoliticalTag.ORLEANS_BRANDAO,
];

export function sortTags(tags: PoliticalTag[]): PoliticalTag[] {
  return [...tags].sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b));
}
