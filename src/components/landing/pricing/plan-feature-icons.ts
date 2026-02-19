import {
  Bolt,
  Book,
  Download,
  Folder,
  RefreshCircle,
  Share,
  StarFall,
  Upload,
  VolumeLoud,
} from '@solar-icons/react/ssr';

export const MEMBER_FEATURE_ICONS = [
  Bolt,
  Folder,
  Upload,
  StarFall,
  VolumeLoud,
  Download,
] as const;

export type MemberIcon = (typeof MEMBER_FEATURE_ICONS)[number];

export function getMemberFeatureIcon(feature: string, index: number): MemberIcon | undefined {
  const lower = feature.toLowerCase();
  if (lower.includes('export') || lower.includes('csv') || lower.includes('download')) {
    return Download;
  }
  if (lower.includes('audio') || lower.includes('voice') || lower.includes('native')) {
    return VolumeLoud;
  }
  if (lower.includes('folder') || lower.includes('custom folder')) {
    return Folder;
  }
  if (lower.includes('vocabulary') || (lower.includes('unlimited') && lower.includes('word'))) {
    return Bolt;
  }
  if (lower.includes('priority') || lower.includes('high-speed') || lower.includes('speed')) {
    return Upload;
  }
  if (lower.includes('ai') && (lower.includes('sentence') || lower.includes('contextual'))) {
    return StarFall;
  }
  return MEMBER_FEATURE_ICONS[index];
}

export const GUEST_FEATURE_ICONS = [
  RefreshCircle,
  Folder,
  Book,
  Download,
  Share,
] as const;
