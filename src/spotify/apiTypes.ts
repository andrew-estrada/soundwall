/** Minimal Spotify Web API shapes used by Soundwall. */

export interface SpotifyApiExternalUrls {
  spotify: string
}

export interface SpotifyApiArtist {
  id: string
  name: string
}

export interface SpotifyApiImage {
  url: string
  width: number | null
  height: number | null
}

export interface SpotifyApiAlbum {
  id: string
  name: string
  images: SpotifyApiImage[]
  external_urls: SpotifyApiExternalUrls
  artists: SpotifyApiArtist[]
  release_date?: string
}

export interface SpotifyApiSearchAlbumsResponse {
  albums: {
    items: SpotifyApiAlbum[]
  }
}

export interface SpotifyApiTrack {
  id: string
  name: string
  album: SpotifyApiAlbum
  artists: SpotifyApiArtist[]
}

export interface SpotifyApiTopTracksResponse {
  items: SpotifyApiTrack[]
}

export interface SpotifyApiErrorBody {
  error?: {
    status: number
    message: string
  }
}
