import { Download, FileImage, LoaderCircle, LogOut, Shuffle } from 'lucide-react'
import { useState } from 'react'
import {
  CollageExportError,
  exportCollagePdf,
  exportCollagePng,
  findGridPresetByDimensions,
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
  orderedAlbums: AlbumCandidate[]
  availableAlbumCount: number
  isConnected: boolean
  disabled?: boolean
  onLogout: () => void
  onRetryTracks?: () => void
  tracksError?: string | null
}

const EXPORT_GROUPS = [
  { label: 'Square', category: 'square' as const },
  { label: 'Wallpaper', category: 'wallpaper' as const },
  { label: 'Poster', category: 'poster' as const },
]

const ORDER_OPTIONS: { value: CollageOrder; label: string }[] = [
  { value: 'rank', label: 'Ranked' },
  { value: 'random', label: 'Shuffled' },
]

export function ControlPanel({
  settings,
  onSettingsChange,
  orderedAlbums,
  availableAlbumCount,
  isConnected,
  disabled = true,
  onLogout,
  onRetryTracks,
  tracksError = null,
}: ControlPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportingFormat, setExportingFormat] = useState<'png' | 'pdf' | null>(null)
  const [exportMessage, setExportMessage] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const cellCount = settings.gridCols * settings.gridRows
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
  const hasAlbumShortage = isConnected && availableAlbumCount > 0 && availableAlbumCount < cellCount
  const hasAspectMismatch = hasExportGridAspectMismatch(settings)
  const showPosterPdfHint = isLargePosterExport(settings.exportPresetId)

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

  function handleShuffleLayout() {
    if (settings.order === 'random') {
      onSettingsChange({
        ...settings,
        shuffleSeed: settings.shuffleSeed + 1,
      })
      return
    }

    onSettingsChange({
      ...settings,
      order: 'random',
      shuffleSeed: settings.shuffleSeed + 1,
    })
  }

  async function handleExport(format: 'png' | 'pdf') {
    setIsExporting(true)
    setExportingFormat(format)
    setExportError(null)
    setExportMessage(null)

    try {
      const exportOptions = {
        albums: orderedAlbums,
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
      <h2 className="controls-panel__title">Controls</h2>

      <div className="controls-panel__stats" aria-live="polite">
        <p className="controls-panel__stat">
          <span className="controls-panel__stat-label">Albums available</span>
          <span className="controls-panel__stat-value">{availableAlbumCount}</span>
        </p>
        <p className="controls-panel__stat">
          <span className="controls-panel__stat-label">Grid cells</span>
          <span className="controls-panel__stat-value">{cellCount}</span>
        </p>
      </div>

      {hasAlbumShortage ? (
        <p className="controls-panel__warning" role="status">
          Only {availableAlbumCount} albums available for a {settings.gridCols} × {settings.gridRows}{' '}
          grid. Empty cells will use the background color.
          {settings.oneAlbumPerArtist
            ? ' One album per artist limits variety — compilation albums share one artist slot.'
            : null}
        </p>
      ) : null}

      {!isConnected ? (
        <p className="controls-panel__hint">Connect Spotify to generate your collage.</p>
      ) : null}

      <div className="controls-panel__section">
        <h3 className="controls-panel__section-title">Layout</h3>

        <div className="control-field">
          <label className="control-field__label" htmlFor="export-size">
            Export size
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
        </div>

        {showRecommendedGrid && recommendedGrid ? (
          <div className="controls-panel__inline-action">
            <p className="controls-panel__hint">
              Export size and grid layout are independent. Recommended grid:{' '}
              {formatRecommendedGrid(recommendedGrid)}.
            </p>
            <button
              type="button"
              className="export-button export-button--ghost"
              disabled={disabled}
              onClick={applyRecommendedGrid}
            >
              Apply recommended grid
            </button>
          </div>
        ) : null}

        <div className="control-field">
          <label className="control-field__label" htmlFor="grid-size">
            Grid size
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
                {preset.label} ({formatRecommendedGrid(preset.recommendedGrid)})
              </option>
            ))}
          </select>
        </div>

        <div className="control-field">
          <div className="control-field__label-row">
            <label className="control-field__label" htmlFor="spacing">
              Gap
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
            Background color
          </label>
          <input
            id="background-color"
            className="control-field__input"
            type="color"
            value={settings.backgroundColor}
            disabled={disabled}
            onChange={(event) => update('backgroundColor', event.target.value)}
          />
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
        <h3 className="controls-panel__section-title">Albums</h3>

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
          <span className="control-toggle__label">One album per artist</span>
          <button
            type="button"
            role="switch"
            className="control-toggle__switch"
            data-checked={settings.oneAlbumPerArtist}
            aria-checked={settings.oneAlbumPerArtist}
            disabled={disabled}
            onClick={() => update('oneAlbumPerArtist', !settings.oneAlbumPerArtist)}
          >
            <span className="control-toggle__thumb" />
            <span className="sr-only">One album per artist</span>
          </button>
        </div>

        <button
          type="button"
          className="export-button"
          disabled={disabled || availableAlbumCount === 0}
          onClick={handleShuffleLayout}
        >
          <Shuffle size={16} aria-hidden="true" />
          {settings.order === 'random' ? 'Regenerate shuffle' : 'Shuffle layout'}
        </button>

        {settings.order === 'rank' ? (
          <p className="controls-panel__hint">Shuffles the current albums and switches order to Shuffled.</p>
        ) : null}
      </div>

      <div className="controls-panel__section">
        <h3 className="controls-panel__section-title">Export</h3>

        {showPosterPdfHint ? (
          <p className="controls-panel__hint">
            Large poster exports are most reliable as PNG. PDF may downscale the image to fit browser
            limits.
          </p>
        ) : null}

        <button
          type="button"
          className="export-button export-button--primary"
          disabled={disabled || isExporting || orderedAlbums.length === 0}
          onClick={() => void handleExport('png')}
        >
          {exportingFormat === 'png' ? (
            <LoaderCircle className="export-button__spinner" size={16} aria-hidden="true" />
          ) : (
            <FileImage size={16} aria-hidden="true" />
          )}
          {exportingFormat === 'png' ? 'Exporting PNG…' : 'Export PNG'}
        </button>

        <button
          type="button"
          className="export-button"
          disabled={disabled || isExporting || orderedAlbums.length === 0}
          onClick={() => void handleExport('pdf')}
        >
          {exportingFormat === 'pdf' ? (
            <LoaderCircle className="export-button__spinner" size={16} aria-hidden="true" />
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
            className="export-button export-button--ghost"
            disabled={isExporting}
            onClick={onRetryTracks}
          >
            Retry loading tracks
          </button>
        ) : null}
      </div>

      <div className="controls-panel__section">
        <h3 className="controls-panel__section-title">Account</h3>

        <button
          type="button"
          className="export-button export-button--ghost"
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
