# Creates Soundwall GitHub labels, milestones, and roadmap issues.
# Requires: gh auth login (run once before this script)

$ErrorActionPreference = 'Stop'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
$repo = 'andrew-estrada/soundwall'

function Invoke-Gh {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & $gh @Args
    if ($LASTEXITCODE -ne 0) { throw "gh failed: $($Args -join ' ')" }
}

Write-Host 'Checking GitHub authentication...'
& $gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Not authenticated. Run: gh auth login'
}

$labels = @(
    @{ name = 'mvp'; color = '0E8A16'; description = 'Core MVP scope' },
    @{ name = 'ux'; color = '1D76DB'; description = 'User experience and onboarding' },
    @{ name = 'export'; color = '5319E7'; description = 'PNG/PDF export and print output' },
    @{ name = 'customization'; color = 'FBCA04'; description = 'Collage editing and layout control' },
    @{ name = 'spotify'; color = '1DB954'; description = 'Spotify API and data sources' },
    @{ name = 'privacy'; color = 'D93F0B'; description = 'Local-first privacy and data handling' },
    @{ name = 'good first issue'; color = '7057FF'; description = 'Good entry point for new contributors' },
    @{ name = 'future'; color = 'C5DEF5'; description = 'Later-phase or research work' }
)

Write-Host 'Creating labels...'
$existingLabels = (& $gh label list --repo $repo --json name | ConvertFrom-Json).name
foreach ($label in $labels) {
    if ($existingLabels -contains $label.name) {
        Write-Host "  skip label: $($label.name)"
        continue
    }
    Invoke-Gh label create $label.name --repo $repo --color $label.color --description $label.description --force
    Write-Host "  created label: $($label.name)"
}

$milestones = @(
    @{ title = 'v0.1.0 MVP Release'; description = 'Initial Spotify auto-collage MVP' },
    @{ title = 'v0.1.1 UX Polish'; description = 'Onboarding, persistence, and README polish' },
    @{ title = 'v0.2.0 Customization'; description = 'Manual collage editing and export controls' },
    @{ title = 'v0.3.0 Data Sources'; description = 'Playlists, history import, and new music sources' },
    @{ title = 'v1.0.0 Stable'; description = 'Stable release with print-ready export' }
)

Write-Host 'Creating milestones...'
$existingMilestones = @(& $gh api "repos/$repo/milestones" | ConvertFrom-Json)
foreach ($milestone in $milestones) {
    if (($existingMilestones | Where-Object { $_.title -eq $milestone['title'] }).Count -gt 0) {
        Write-Host "  skip milestone: $($milestone['title'])"
        continue
    }
    Invoke-Gh api "repos/$repo/milestones" -f "title=$($milestone['title'])" -f "description=$($milestone['description'])"
    Write-Host "  created milestone: $($milestone['title'])"
    $existingMilestones = @(& $gh api "repos/$repo/milestones" | ConvertFrom-Json)
}

function New-IssueIfMissing {
    param(
        [string]$Title,
        [string]$Body,
        [string[]]$Labels,
        [string]$Milestone
    )

    $existingIssues = @(& $gh issue list --repo $repo --state all --limit 200 --json title | ConvertFrom-Json)
    if (($existingIssues | ForEach-Object { $_.title }) -contains $Title) {
        Write-Host "  skip issue: $Title"
        return
    }

    $bodyFile = New-TemporaryFile
    try {
        $utf8 = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($bodyFile.FullName, $Body, $utf8)
        $labelArgs = $Labels | ForEach-Object { '--label'; $_ }
        Invoke-Gh issue create --repo $repo --title $Title --body-file $bodyFile.FullName --milestone $Milestone @labelArgs
        Write-Host "  created issue: $Title"
    }
    finally {
        Remove-Item -Force $bodyFile.FullName -ErrorAction SilentlyContinue
    }
}

$issues = @(
    @{
        Title = 'Improve first-run onboarding'
        Milestone = 'v0.1.1 UX Polish'
        Labels = @('mvp', 'ux')
        Body = @'
## Summary

Improve the first-run experience after a user lands on Soundwall or connects Spotify for the first time.

## Context

The connect screen already explains the 3-step flow, but we can reduce confusion around redirect URI setup, env vars, and what happens immediately after login.

## Acceptance criteria

- [ ] Clear guidance when `VITE_SPOTIFY_CLIENT_ID` is missing or invalid
- [ ] Post-login state explains that the collage is being generated from top tracks
- [ ] Empty or partial album results show actionable next steps (retry, adjust grid, log out)
- [ ] Copy stays aligned with local-first / no-backend privacy model

## Notes

Keep the home screen simple. Main action remains Connect Spotify.
'@
    },
    @{
        Title = 'Add save settings to localStorage'
        Milestone = 'v0.1.1 UX Polish'
        Labels = @('mvp', 'ux', 'privacy')
        Body = @'
## Summary

Persist collage settings in `localStorage` so grid size, spacing, background color, order mode, export preset, and one-album-per-artist survive page reloads.

## Context

README currently documents: no persistence for collage settings or track data between sessions.

## Acceptance criteria

- [ ] Save `CollageSettings` to `localStorage` on change (debounced is fine)
- [ ] Restore settings on app load with safe defaults for missing/invalid data
- [ ] Do **not** persist Spotify tokens, top tracks, or listening history
- [ ] Log out clears session auth only; settings persistence behavior is documented

## Out of scope

- Cloud sync or accounts
- Persisting fetched album/track data
'@
    },
    @{
        Title = 'Add remove album from collage'
        Milestone = 'v0.2.0 Customization'
        Labels = @('customization', 'mvp')
        Body = @'
## Summary

Let users remove individual albums from the generated collage without re-fetching Spotify data.

## Acceptance criteria

- [ ] Remove action available from collage preview or album list UI
- [ ] Removed albums are excluded from preview and PNG/PDF export
- [ ] Grid reflows cleanly when an album is removed
- [ ] Removal state is session-local unless paired with settings persistence work

## Notes

This is the first step toward manual collage editing. Pair with "Add removed albums tray" for undo/restore.
'@
    },
    @{
        Title = 'Add removed albums tray'
        Milestone = 'v0.2.0 Customization'
        Labels = @('customization', 'ux')
        Body = @'
## Summary

Show removed albums in a tray/panel so users can restore them to the collage.

## Acceptance criteria

- [ ] Removed albums appear in a dedicated tray with cover thumbnail and album/artist name
- [ ] Restore action puts the album back into the collage
- [ ] Tray state stays in sync with preview and export
- [ ] Empty tray is hidden or clearly inactive

## Depends on

- Remove album from collage
'@
    },
    @{
        Title = 'Add manual shuffle seed'
        Milestone = 'v0.2.0 Customization'
        Labels = @('customization', 'ux')
        Body = @'
## Summary

Expose a manual shuffle seed so users can reproduce the same shuffled layout.

## Context

`orderAlbums` already accepts a `shuffleSeed` parameter for deterministic shuffles.

## Acceptance criteria

- [ ] UI control to set or regenerate shuffle seed when order mode is Shuffled
- [ ] Same seed + same album set produces the same layout
- [ ] Seed is included in settings persistence if localStorage work lands first
- [ ] Copy button or visible seed value for sharing/reproducing layouts locally
'@
    },
    @{
        Title = 'Add drag-and-drop reorder'
        Milestone = 'v0.2.0 Customization'
        Labels = @('customization')
        Body = @'
## Summary

Allow manual drag-and-drop reordering of albums in the collage grid.

## Context

Explicitly out of scope for V1 per product rules; planned for customization milestone.

## Acceptance criteria

- [ ] Drag album tiles to swap/reorder positions in the grid
- [ ] Manual order overrides rank/shuffle until reset
- [ ] Export uses the manually ordered layout
- [ ] Keyboard-accessible alternative or documented limitation

## Notes

Prefer a focused implementation over a full layout editor.
'@
    },
    @{
        Title = 'Add manual Spotify album search'
        Milestone = 'v0.2.0 Customization'
        Labels = @('customization', 'spotify')
        Body = @'
## Summary

Add Spotify search so users can manually include albums in the collage.

## Acceptance criteria

- [ ] Search Spotify albums by name while authenticated
- [ ] Add selected album to collage (respecting grid capacity rules)
- [ ] Added albums use Spotify cover art with existing CORS/export behavior
- [ ] Clear UI distinction between auto-ranked albums and manually added albums

## Out of scope

- Non-Spotify sources
- Editing track-level data
'@
    },
    @{
        Title = 'Add print bleed/safe-area guides'
        Milestone = 'v1.0.0 Stable'
        Labels = @('export')
        Body = @'
## Summary

Add optional print bleed and safe-area guides for poster export presets.

## Context

Poster presets already exist at 300 DPI (11×17, 18×24, 24×36). Print shops often need bleed/safe zones.

## Acceptance criteria

- [ ] Toggle to show bleed and safe-area overlays in preview for poster presets
- [ ] Guides scale correctly with selected export dimensions
- [ ] Export can optionally include bleed margin metadata or extended canvas (TBD in implementation)
- [ ] Document recommended print settings in README or in-app help

## Notes

Research standard bleed values (e.g. 0.125 in) and keep preview performant.
'@
    },
    @{
        Title = 'Add streaming history import'
        Milestone = 'v0.3.0 Data Sources'
        Labels = @('spotify', 'future', 'privacy')
        Body = @'
## Summary

Investigate importing extended listening history beyond Spotify top tracks (e.g. exported streaming history) to improve collage coverage.

## Acceptance criteria

- [ ] Document supported import format(s) and privacy implications
- [ ] Parse import locally in the browser; no upload to a server
- [ ] Merge imported history with existing top-track scoring
- [ ] Clear error states for invalid or partial files

## Open questions

- Which export formats are realistic for users to obtain?
- How do we stay within Spotify Developer Terms?
'@
    },
    @{
        Title = 'Add playlist collage mode'
        Milestone = 'v0.3.0 Data Sources'
        Labels = @('spotify')
        Body = @'
## Summary

Generate a collage from a selected Spotify playlist instead of only top tracks.

## Acceptance criteria

- [ ] Authenticated users can pick one of their playlists
- [ ] Albums are inferred from playlist tracks with sensible de-duplication
- [ ] Existing layout/export controls continue to work
- [ ] Empty or single-album playlists show helpful errors

## Notes

May require additional Spotify scopes beyond `user-top-read`.
'@
    },
    @{
        Title = 'Add Apple Music import research'
        Milestone = 'v0.3.0 Data Sources'
        Labels = @('future')
        Body = @'
## Summary

Research whether and how Soundwall could support Apple Music as an additional data source.

## Deliverable

A short research note covering:

- [ ] Available Apple Music APIs / MusicKit web constraints
- [ ] Auth model and whether local-first/no-backend is feasible
- [ ] Artwork licensing and export implications
- [ ] Recommended MVP approach or explicit deferral rationale

## Out of scope

- Full Apple Music implementation in this issue
'@
    },
    @{
        Title = 'Add export quality settings'
        Milestone = 'v0.2.0 Customization'
        Labels = @('export')
        Body = @'
## Summary

Let users control export quality settings such as PNG compression level and PDF resolution/DPI where applicable.

## Context

Large poster exports already stress browser memory. Quality controls should balance fidelity and performance.

## Acceptance criteria

- [ ] UI for export quality preset or advanced options
- [ ] PNG export respects chosen quality/size tradeoff
- [ ] PDF export documents effective DPI for poster presets
- [ ] Warn when selected quality may fail on very large canvases

## Notes

Keep defaults aligned with current behavior so existing exports do not regress.
'@
    },
    @{
        Title = 'Add example screenshots to README'
        Milestone = 'v0.1.1 UX Polish'
        Labels = @('mvp', 'ux', 'good first issue')
        Body = @'
## Summary

Add example screenshots to the README so new users can see Soundwall output before running locally.

## Acceptance criteria

- [ ] Include at least one connect/home screenshot and one generated collage screenshot
- [ ] Store images under `docs/` or similar and reference them from README
- [ ] Use representative but privacy-safe example data
- [ ] Keep README load time reasonable (compressed PNG/WebP)

## Notes

Good first issue for contributors who can run the app locally and capture screenshots.
'@
    }
)

Write-Host 'Creating issues...'
foreach ($issue in $issues) {
    New-IssueIfMissing -Title $issue.Title -Body $issue.Body -Labels $issue.Labels -Milestone $issue.Milestone
}

Write-Host 'Done. Open issues:'
Invoke-Gh issue list --repo $repo --limit 20
