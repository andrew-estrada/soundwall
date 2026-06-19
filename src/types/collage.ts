import type { SpotifyTimeRange } from './spotify'

export type CollageOrder = 'rank' | 'random'

export type CollagePresetCategory = 'square' | 'wallpaper' | 'poster' | 'grid'

export interface RecommendedGrid {
  cols: number
  rows: number
}

export interface CollagePreset {
  id: string
  label: string
  width: number
  height: number
  recommendedGrid: RecommendedGrid
  category: CollagePresetCategory
}

export interface CollageSettings {
  exportPresetId: string
  gridPresetId: string
  gridCols: number
  gridRows: number
  spacing: number
  backgroundColor: string
  order: CollageOrder
  oneAlbumPerArtist: boolean
  exportWidth: number
  exportHeight: number
  shuffleSeed: number
}

export interface AlbumCandidate {
  albumId: string
  albumName: string
  artistId: string
  artistName: string
  imageUrl: string
  spotifyUrl: string
  score: number
  sourceTrackNames: string[]
  sourceTimeRanges: SpotifyTimeRange[]
}

export interface ScoreAlbumsOptions {
  gridCols: number
  gridRows: number
  oneAlbumPerArtist: boolean
  returnAll?: boolean
}
