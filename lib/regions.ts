import type { PlatformRegion, RegionalRoute, RegionConfig } from '@/types/riot'

export const REGIONS: Record<string, RegionConfig> = {
  euw: {
    platform: 'euw1',
    regional: 'europe',
    name: 'Europe West',
  },
  eune: {
    platform: 'eun1',
    regional: 'europe',
    name: 'Europe Nordic & East',
  },
  na: {
    platform: 'na1',
    regional: 'americas',
    name: 'North America',
  },
  kr: {
    platform: 'kr',
    regional: 'asia',
    name: 'Korea',
  },
  jp: {
    platform: 'jp1',
    regional: 'asia',
    name: 'Japan',
  },
  br: {
    platform: 'br1',
    regional: 'americas',
    name: 'Brazil',
  },
  lan: {
    platform: 'la1',
    regional: 'americas',
    name: 'Latin America North',
  },
  las: {
    platform: 'la2',
    regional: 'americas',
    name: 'Latin America South',
  },
  oce: {
    platform: 'oc1',
    regional: 'sea',
    name: 'Oceania',
  },
  tr: {
    platform: 'tr1',
    regional: 'europe',
    name: 'Turkey',
  },
  ru: {
    platform: 'ru',
    regional: 'europe',
    name: 'Russia',
  },
}

export const DEFAULT_REGION = 'euw'

export function getRegionConfig(regionKey: string): RegionConfig {
  return REGIONS[regionKey.toLowerCase()] || REGIONS[DEFAULT_REGION]
}

export function getPlatformUrl(platform: PlatformRegion): string {
  return `https://${platform}.api.riotgames.com`
}

export function getRegionalUrl(regional: RegionalRoute): string {
  return `https://${regional}.api.riotgames.com`
}
