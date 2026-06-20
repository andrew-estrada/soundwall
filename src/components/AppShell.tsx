import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  preview: ReactNode
  controls: ReactNode
  footer?: ReactNode
}

export function AppShell({ header, preview, controls, footer }: AppShellProps) {
  return (
    <div className="app-shell">
      {header}

      <div className="app-shell__main">
        <div className="app-shell__preview">{preview}</div>
        <div className="app-shell__controls">{controls}</div>
      </div>

      {footer}
    </div>
  )
}
