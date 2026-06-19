export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term'

export interface SpotifyImage {
  url: string
  width: number
  height: number
}

export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  spotifyUrl: string
  artists: SpotifyArtist[]
}

export interface SpotifyTrack {
  id: string
  name: string
  album: SpotifyAlbum
  artists: SpotifyArtist[]
}

export interface RankedSpotifyTrack extends SpotifyTrack {
  timeRange: SpotifyTimeRange
  rank: number
}

export type TopTracksFetchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface TopTracksState {
  status: TopTracksFetchStatus
  tracks: RankedSpotifyTrack[]
  error: string | null
}
