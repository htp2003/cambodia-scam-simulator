import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'

interface RetroWindowProps extends PropsWithChildren {
  className?: string
  controls?: string
  title: string
}

export function RetroWindow({
  children,
  className = '',
  controls = '□ ×',
  title,
}: RetroWindowProps) {
  return (
    <section className={`retro-window ${className}`}>
      <div className="retro-titlebar">
        <span>{title}</span>
        <span aria-hidden="true">{controls}</span>
      </div>
      {children}
    </section>
  )
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <h3 className="retro-section-title">{children}</h3>
}

interface RetroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'default' | 'danger' | 'good'
}

export function RetroButton({
  children,
  className = '',
  tone = 'default',
  type = 'button',
  ...props
}: RetroButtonProps) {
  return (
    <button
      type={type}
      className={`retro-button retro-button-${tone} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface MeterProps {
  label: string
  tone?: 'blue' | 'green' | 'red' | 'yellow'
  value: number
}

export function Meter({ label, tone = 'blue', value }: MeterProps) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="retro-meter-block">
      <div className="retro-row retro-small">
        <strong>{label}</strong>
        <span>{Math.round(value)}</span>
      </div>
      <div className="retro-meter">
        <div
          className={`retro-meter-fill retro-meter-${tone}`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  )
}

interface ModalProps extends PropsWithChildren {
  actions?: ReactNode
  title: string
}

export function RetroModal({ actions, children, title }: ModalProps) {
  return (
    <div className="retro-modal-backdrop">
      <RetroWindow className="retro-dialog" title={title} controls="">
        <div className="retro-dialog-content">{children}</div>
        {actions && <div className="retro-dialog-actions">{actions}</div>}
      </RetroWindow>
    </div>
  )
}
