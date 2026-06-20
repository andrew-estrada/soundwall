import { Download, FileImage, ListOrdered, LoaderCircle, LogOut, RotateCcw, Shuffle } from 'lucide-react'
import { useState } from 'react'
import {
  ALBUM_COUNT_OPTIONS,
  BACKGROUND_PRESETS,
  CORNER_RADIUS_MAX,
  BORDER_WIDTH_MAX,
  CollageExportError,
  colorsMatch,
  exportCollagePdf,
  exportCollagePng,
  findGridPresetByDimensions,
  formatAlbumCountGridHint,
  formatExportMessage,
  gridsMatch,
  hasExportGridAspectMismatch,
  isLargePosterExport,
} from '../collage'
import {
  EXPORT_SIZE_PRESETS,
  GRID_PRESETS,
  findCollagePreset,
  formatRecommendedGrid,
} from '../collage/presets'
import type { AlbumCandidate, CollageOrder, CollageSettings } from '../types'

interface ControlPanelProps {
  settings: CollageSettings
  onSettingsChange: (settings: CollageSettings) => void
  visibleAlbums: AlbumCandidate[]
  availableAlbumCount: number
  isConnected: boolean
  disabled?: boolean
  onLogout: () => void
  onResetSettings: () => void
  onReshuffle: () => void
  showResetToRanked?: boolean
  showResetToShuffled?: boolean
  onResetToRanked?: () => void
  onResetToShuffled?: () => void
  onRetryTracks?: () => void
  tracksError?: string | null
}

const EXPORT_GROUPS = [
  { label: 'Square', category: 'square' as const },
  { label: 'Wallpaper', category: 'wallpaper' as const },
  { label: 'Poster', category: 'poster' as const },
]

const ORDER_OPTIONS: { value: CollageOrder; label: string }[] = [
  { value: 'rank', label: 'Most played first' },
  { value: 'random', label: 'Shuffled' },
]

export function ControlPanel({
  settings,
  onSettingsChange,
  visibleAlbums,
  availableAlbumCount,
  isConnected,
  disabled = true,
  onLogout,
  onResetSettings,
  onReshuffle,
  showResetToRanked = false,
  showResetToShuffled = false,
  onResetToRanked,
  onResetToShuffled,
  onRetryTracks,
  tracksError = null,
}: ControlPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'png' | 'pdf' | null>(null)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const cellCount = settings.gridCols * settings.gridRows
  const selectedAlbumCount = visibleAlbums.length
  const hasInsufficientAlbums =
    isConnected && availableAlbumCount > 0 && availableAlbumCount < settings.albumCount
  const hasLayoutShortage = cellCount < settings.albumCount
  const hasEmptyCells =
    isConnected && selectedAlbumCount > 0 && cellCount > selectedAlbumCount
  const albumCountGridHint = formatAlbumCountGridHint(settings.albumCount, settings.gridPresetId)
  const allowArtistDuplicates = !settings.oneAlbumPerArtist
  const exportPreset = findCollagePreset(settings.exportPresetId)
  const recommendedGrid = exportPreset?.recommendedGrid
  const showRecommendedGrid =
    exportPreset &&
    exportPreset.category !== 'grid' &&
    recommendedGrid &&
    !gridsMatch(recommendedGrid, {
      cols: settings.gridCols,
      rows: settings.gridRows,
    })
  const hasAspectMismatch = hasExportGridAspectMismatch(settings)
  const showPosterPdfHint = isLargePosterExport(settings.exportPresetId)
  const canExport = !disabled && !isExporting && visibleAlbums.length > 0

  function update<K extends keyof CollageSettings>(key: K, value: CollageSettings[K]) {
    onSettingsChange({ ...settings, [key]: value })
  }

  function handleExportPresetChange(presetId: string) {
    const preset = findCollagePreset(presetId)
    if (!preset) {
      return
    }

    onSettingsChange({
      ...settings,
      exportPresetId: preset.id,
      exportWidth: preset.width,
      exportHeight: preset.height,
    })
  }

  function handleGridPresetChange(presetId: string) {
    const preset = findCollagePreset(presetId)
    if (!preset) {
      return
    }

    onSettingsChange({
      ...settings,
      gridPresetId: preset.id,
      gridCols: preset.recommendedGrid.cols,
      gridRows: preset.recommendedGrid.rows,
    })
  }

  function applyRecommendedGrid() {
    if (!recommendedGrid) {
      return
    }

    const gridPreset = findGridPresetByDimensions(
      recommendedGrid.cols,
      recommendedGrid.rows,
    )

    onSettingsChange({
      ...settings,
      gridCols: recommendedGrid.cols,
      gridRows: recommendedGrid.rows,
      gridPresetId: gridPreset?.id ?? settings.gridPresetId,
    })
  }

  async function handleExport(format: 'png' | 'pdf') {
    setIsExporting(true)
    setExportingFormat(format)
    setExportError(null)
    setExportMessage(null)

    try {
      const exportOptions = {
        albums: visibleAlbums,
        settings,
      }

      const result =
        format === 'png'
          ? await exportCollagePng(exportOptions)
          : await exportCollagePdf(exportOptions)

      setExportMessage(formatExportMessage(result))
    } catch (error) {
      setExportError(
        error instanceof CollageExportError
          ? error.message
          : `${format.toUpperCase()} export failed. Please try again.`,
      )
    } finally {
      setIsExporting(false)
      setExportingFormat(null)
    }
  }

  return (
    <aside className="controls-panel" aria-label="Collage controls">
      <h2 className="controls-panel__title">Customize</h2>

      {hasInsufficientAlbums ? (
        <p className="controls-panel__warning" role="status">
          You have {availableAlbumCount} album covers — fewer than the {settings.albumCount} you
          selected. We&apos;ll use every cover we found. Try allowing artist duplicates for more
          variety.
        </p>
      ) : null}

      {hasLayoutShortage ? (
        <p className="controls-panel__warning" role="status">
          Your {settings.gridCols} × {settings.gridRows} layout only shows {cellCount} covers, but
          you selected {settings.albumCount}.
          {albumCountGridHint ? ` ${albumCountGridHint}` : ' Try a larger layout.'}
        </p>
      ) : null}

      {!hasLayoutShortage && hasEmptyCells ? (
        <p className="controls-panel__warning" role="status">
          Your layout has {cellCount} cells but only {selectedAlbumCount} covers will appear. Empty
          cells use your background color.
        </p>
      ) : null}

      <div className="controls-panel__section">
        <div className="control-field">
          <label className="control-field__label" htmlFor="export-size">
            Size
          </label>
          <select
            id="export-size"
            className="control-field__select"
            value={settings.exportPresetId}
            disabled={disabled}
            onChange={(event) => handleExportPresetChange(event.target.value)}
          >
            {EXPORT_GROUPS.map((group) => (
              <optgroup key={group.category} label={group.label}>
                {EXPORT_SIZE_PRESETS.filter((preset) => preset.category === group.category).map(
                  (preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} ({preset.width} × {preset.height})
                    </option>
                  ),
                )}
              </optgroup>
            ))}
          </select>
          <p className="control-field__hint">Final dimensions of your exported image.</p>
        </div>

        <div className="control-field">
          <label className="control-field__label" htmlFor="album-count">
            Album count
          </label>
          <select
            id="album-count"
            className="control-field__select"
            value={settings.albumCount}
            disabled={disabled}
            onChange={(event) => update('albumCount', Number(event.target.value))}
          >
            {ALBUM_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count} covers
              </option>
            ))}
          </select>
          {albumCountGridHint && !hasLayoutShortage ? (
            <p className="control-field__hint">{albumCountGridHint}</p>
          ) : (
            <p className="control-field__hint">How many album covers to include in the collage.</p>
          )}
        </div>

        {showRecommendedGrid && recommendedGrid ? (
          <div className="controls-panel__inline-action">
            <p className="control-field__hint">
              Export size and grid layout are independent. Recommended grid:{' '}
              {formatRecommendedGrid(recommendedGrid)}.
            </p>
            <button
              type="button"
              className="control-button control-button--ghost"
              disabled={disabled}
              onClick={applyRecommendedGrid}
            >
              Apply recommended grid
            </button>
          </div>
        ) : null}

        <div className="control-field">
          <label className="control-field__label" htmlFor="grid-size">
            Layout
          </label>
          <select
            id="grid-size"
            className="control-field__select"
            value={settings.gridPresetId}
            disabled={disabled}
            onChange={(event) => handleGridPresetChange(event.target.value)}
          >
            {GRID_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label} ({formatRecommendedGrid(preset.recommendedGrid)} covers)
              </option>
            ))}
          </select>
        </div>

        <div className="control-field">
          <div className="control-field__label-row">
            <label className="control-field__label" htmlFor="spacing">
              Spacing
            </label>
            <span className="control-field__value">{settings.spacing}px</span>
          </div>
          <input
            id="spacing"
            className="control-field__input"
            type="range"
            min={0}
            max={24}
            step={1}
            value={settings.spacing}
            disabled={disabled}
            onChange={(event) => update('spacing', Number(event.target.value))}
          />
        </div>

        <div className="control-field">
          <label className="control-field__label" htmlFor="background-color">
            Background
          </label>
          <div className="background-presets" role="group" aria-label="Background presets">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected = colorsMatch(settings.backgroundColor, preset.color)

              return (
                <button
                  key={preset.id}
                  type="button"
                  className="background-presets__swatch"
                  style={{ backgroundColor: preset.color }}
                  title={preset.label}
                  aria-label={preset.label}
                  aria-pressed={isSelected}
                  data-selected={isSelected}
                  disabled={disabled}
                  onClick={() => update('backgroundColor', preset.color)}
                />
              )
            })}
          </div>
          <div className="control-field__color-row">
            <input
              id="background-color"
              className="control-field__color"
              type="color"
              value={settings.backgroundColor}
              disabled={disabled}
              onChange={(event) => update('backgroundColor', event.target.value)}
            />
            <span className="control-field__value">{settings.backgroundColor.toUpperCase()}</span>
          </div>
          <p className="control-field__hint">Shows in the spacing and any empty cells.</p>
        </div>
      </div>

      {hasAspectMismatch ? (
        <p className="controls-panel__warning" role="status">
          Export size aspect ratio ({settings.exportWidth} × {settings.exportHeight}) differs from
          the grid layout ({settings.gridCols} × {settings.gridRows}). Preview shows the grid
          shape; export uses the selected export dimensions.
        </p>
      ) : null}

      <div className="controls-panel__section">
        <h3 className="controls-panel__section-title">Appearance</h3>

        <div className="control-toggle">
          <span className="control-toggle__text">
            <span className="control-toggle__label">Rounded corners</span>
            <span className="control-toggle__hint">Soften album cover edges.</span>
          </span>
          <button
            type="button"
            role="switch"
            className="control-toggle__switch"
            data-checked={settings.roundedCorners}
            aria-checked={settings.roundedCorners}
            disabled={disabled}
            onClick={() => update('roundedCorners', !settings.roundedCorners)}
          >
            <span className="control-toggle__thumb" />
            <span className="sr-only">Rounded corners</span>
          </button>
        </div>

        <div className="control-field">
          <div className="control-field__label-row">
            <label className="control-field__label" htmlFor="corner-radius">
              Corner radius
            </label>
            <span className="control-field__value">{settings.cornerRadius}px</span>
          </div>
          <input
            id="corner-radius"
            className="control-field__input"
            type="range"
            min={0}
            max={CORNER_RADIUS_MAX}
            step={1}
            value={settings.cornerRadius}
            disabled={disabled || !settings.roundedCorners}
            onChange={(event) => update('cornerRadius', Number(event.target.value))}
          />
        </div>

        <div className="control-toggle">
          <span className="control-toggle__text">
            <span className="control-toggle__label">Border</span>
            <span className="control-toggle__hint">Outline each album cover.</span>
          </span>
          <button
            type="button"
            role="switch"
            className="control-toggle__switch"
            data-checked={settings.borderEnabled}
            aria-checked={settings.borderEnabled}
            disabled={disabled}
            onClick={() => update('borderEnabled', !settings.borderEnabled)}
          >
            <span className="control-toggle__thumb" />
            <span className="sr-only">Album cover border</span>
          </button>
        </div>

        <div className="control-field">
          <div className="control-field__label-row">
            <label className="control-field__label" htmlFor="border-width">
              Border width
            </label>
            <span className="control-field__value">{settings.borderWidth}px</span>
          </div>
          <input
            id="border-width"
            className="control-field__input"
            type="range"
            min={1}
            max={BORDER_WIDTH_MAX}
            step={1}
            value={settings.borderWidth}
            disabled={disabled || !settings.borderEnabled}
            onChange={(event) => update('borderWidth', Number(event.target.value))}
          />
        </div>

        <div className="control-field">
          <label className="control-field__label" htmlFor="border-color">
            Border color
          </label>
          <div className="control-field__color-row">
            <input
              id="border-color"
              className="control-field__color"
              type="color"
              value={settings.borderColor}
              disabled={disabled || !settings.borderEnabled}
              onChange={(event) => update('borderColor', event.target.value)}
            />
            <span className="control-field__value">{settings.borderColor.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="controls-panel__section">
        <div className="control-field">
          <label className="control-field__label" htmlFor="order">
            Order
          </label>
          <select
            id="order"
            className="control-field__select"
            value={settings.order}
            disabled={disabled}
            onChange={(event) => update('order', event.target.value as CollageOrder)}
          >
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-toggle">
          <span className="control-toggle__text">
            <span className="control-toggle__label">Artist duplicates</span>
            <span className="control-toggle__hint">Let one artist appear more than once.</span>
          </span>
          <button
            type="button"
            role="switch"
            className="control-toggle__switch"
            data-checked={allowArtistDuplicates}
            aria-checked={allowArtistDuplicates}
            disabled={disabled}
            onClick={() => update('oneAlbumPerArtist', !settings.oneAlbumPerArtist)}
          >
            <span className="control-toggle__thumb" />
            <span className="sr-only">Allow artist duplicates</span>
          </button>
        </div>

        <button
          type="button"
          className="control-button"
          disabled={disabled || settings.order !== 'random' || availableAlbumCount === 0}
          title="Generate a new shuffled order"
          aria-label="Reshuffle album covers"
          onClick={onReshuffle}
        >
          <Shuffle size={16} aria-hidden="true" />
          Reshuffle
        </button>

        {showResetToRanked && onResetToRanked ? (
          <button
            type="button"
            className="control-button control-button--ghost"
            disabled={disabled}
            onClick={onResetToRanked}
          >
            <ListOrdered size={16} aria-hidden="true" />
            Reset to ranked order
          </button>
        ) : null}

        {showResetToShuffled && onResetToShuffled ? (
          <button
            type="button"
            className="control-button control-button--ghost"
            disabled={disabled}
            onClick={onResetToShuffled}
          >
            <Shuffle size={16} aria-hidden="true" />
            Reset to shuffled order
          </button>
        ) : null}
      </div>

      <div className="controls-panel__section">
        <h3 className="controls-panel__section-title">Export</h3>

        {exportPreset ? (
          <p className="controls-panel__export-meta">
            Saves a {exportPreset.width} × {exportPreset.height} px {exportPreset.label.toLowerCase()}.
          </p>
        ) : null}

        {showPosterPdfHint ? (
          <p className="control-field__hint">
            Large poster exports are most reliable as PNG. PDF may downscale the image to fit browser
            limits.
          </p>
        ) : null}

        <button
          type="button"
          className="control-button control-button--primary"
          disabled={!canExport}
          onClick={() => void handleExport('png')}
        >
          {exportingFormat === 'png' ? (
            <LoaderCircle className="control-button__spinner" size={16} aria-hidden="true" />
          ) : (
            <FileImage size={16} aria-hidden="true" />
          )}
          {exportingFormat === 'png' ? 'Exporting PNG…' : 'Export PNG'}
        </button>

        <button
          type="button"
          className="control-button"
          disabled={!canExport}
          onClick={() => void handleExport('pdf')}
        >
          {exportingFormat === 'pdf' ? (
            <LoaderCircle className="control-button__spinner" size={16} aria-hidden="true" />
          ) : (
            <Download size={16} aria-hidden="true" />
          )}
          {exportingFormat === 'pdf' ? 'Exporting PDF…' : 'Export PDF'}
        </button>

        {exportError ? (
          <p className="controls-panel__error" role="alert">
            {exportError}
          </p>
        ) : null}

        {exportMessage ? (
          <p className="controls-panel__success" role="status">
            {exportMessage}
          </p>
        ) : null}

        {onRetryTracks && isConnected && tracksError ? (
          <button
            type="button"
            className="control-button control-button--ghost"
            disabled={isExporting}
            onClick={onRetryTracks}
          >
            Retry loading tracks
          </button>
        ) : null}
      </div>

      <div className="controls-panel__section controls-panel__section--account">
        <button
          type="button"
          className="control-button control-button--ghost"
          disabled={disabled}
          onClick={onResetSettings}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset settings
        </button>
        <p className="control-field__hint">
          Clears saved layout preferences from this browser. Spotify data is never stored here.
        </p>
        <button
          type="button"
          className="control-button control-button--ghost"
          disabled={!isConnected}
          onClick={onLogout}
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  )
}
