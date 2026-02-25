'use client'

import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react'
import { CheckCircle2, Copy, Pencil, Trash2 } from 'lucide-react'

import { useDensity } from '@/components/app/DensityProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CompactListCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  metadata?: React.ReactNode
  status?: React.ReactNode
  trailingMeta?: React.ReactNode
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onMarkFinalized?: () => void
  className?: string
}

export function CompactListCard({
  title,
  subtitle,
  metadata,
  status,
  trailingMeta,
  onEdit,
  onDelete,
  onDuplicate,
  onMarkFinalized,
  className,
}: CompactListCardProps) {
  const { density } = useDensity()
  const [touchEnabled, setTouchEnabled] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [quickMenu, setQuickMenu] = useState<{ x: number; y: number } | null>(null)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragging = useRef(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SWIPE_MAX = 96
  const SWIPE_TRIGGER = 60
  const LONG_PRESS_MS = 600

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTouchEnabled('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    if (!quickMenu) return

    const close = () => setQuickMenu(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)

    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [quickMenu])

  const clearLongPress = () => {
    if (!longPressTimer.current) return
    clearTimeout(longPressTimer.current)
    longPressTimer.current = null
  }

  const closeQuickMenu = () => setQuickMenu(null)

  const densityCardClass =
    density === 'compact'
      ? 'rounded-lg p-2.5'
      : 'rounded-xl p-3.5'

  const subtitleClass = density === 'compact' ? 'text-xs' : 'text-sm'

  const quickActions = useMemo(
    () => [
      onEdit
        ? {
            key: 'edit',
            label: 'Editeaza',
            icon: Pencil,
            onClick: onEdit,
            className: 'text-[var(--agri-text)]',
          }
        : null,
      onDelete
        ? {
            key: 'delete',
            label: 'Sterge',
            icon: Trash2,
            onClick: onDelete,
            className: 'text-red-700',
          }
        : null,
      onDuplicate
        ? {
            key: 'duplicate',
            label: 'Duplica',
            icon: Copy,
            onClick: onDuplicate,
            className: 'text-[var(--agri-text)]',
          }
        : null,
      onMarkFinalized
        ? {
            key: 'finalize',
            label: 'Finalizat',
            icon: CheckCircle2,
            onClick: onMarkFinalized,
            className: 'text-emerald-700',
          }
        : null,
    ].filter(Boolean) as Array<{
      key: string
      label: string
      icon: React.ComponentType<{ className?: string }>
      onClick: () => void
      className: string
    }>,
    [onDelete, onDuplicate, onEdit, onMarkFinalized]
  )

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchEnabled) return

    const touch = event.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    dragging.current = false

    clearLongPress()
    longPressTimer.current = setTimeout(() => {
      setQuickMenu({ x: touch.clientX, y: touch.clientY })
    }, LONG_PRESS_MS)
  }

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchEnabled) return
    if (quickMenu) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current

    if (Math.abs(deltaY) > Math.abs(deltaX) + 8) {
      clearLongPress()
      setDragX(0)
      return
    }

    if (Math.abs(deltaX) > 8) {
      clearLongPress()
      dragging.current = true
      const next = Math.max(-SWIPE_MAX, Math.min(SWIPE_MAX, deltaX))
      setDragX(next)
    }
  }

  const onTouchEnd = () => {
    clearLongPress()

    if (!dragging.current) {
      setDragX(0)
      return
    }

    if (dragX <= -SWIPE_TRIGGER && onDelete) {
      onDelete()
    } else if (dragX >= SWIPE_TRIGGER && onEdit) {
      onEdit()
    }

    dragging.current = false
    setDragX(0)
  }

  const onTouchCancel = () => {
    clearLongPress()
    dragging.current = false
    setDragX(0)
  }

  return (
    <article className={cn('relative', className)}>
      {touchEnabled ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
          {onEdit ? (
            <div className="absolute inset-y-0 left-0 flex w-24 items-center justify-center bg-emerald-600/90 text-xs font-semibold text-white">
              Editeaza
            </div>
          ) : null}
          {onDelete ? (
            <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-red-600/90 text-xs font-semibold text-white">
              Sterge
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn('agri-card relative transition-transform duration-150 ease-out', densityCardClass)}
        style={{ transform: `translateX(${touchEnabled ? dragX : 0}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
      >
        <div className={cn('flex items-start justify-between', density === 'compact' ? 'gap-1.5' : 'gap-2')}>
          <h3 className={cn('line-clamp-1 font-semibold text-[var(--agri-text)]', density === 'compact' ? 'text-sm' : 'text-base')}>{title}</h3>
          {!touchEnabled ? (
            <div className="flex items-center gap-1">
              {onEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-slate-100"
                  onClick={onEdit}
                  aria-label="Editeaza"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={onDelete}
                  aria-label="Sterge"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        {(subtitle || metadata) ? (
          <div className={cn('mt-1 flex items-center gap-2 text-[var(--agri-text-muted)]', subtitleClass)}>
            {subtitle ? <span className="line-clamp-1">{subtitle}</span> : null}
            {metadata ? <span className="line-clamp-1">{metadata}</span> : null}
          </div>
        ) : null}

        {(status || trailingMeta) ? (
          <div className={cn('mt-2 flex items-center justify-between gap-2', density === 'compact' ? '[&_*]:text-[11px]' : '')}>
            <div className="min-w-0">{status}</div>
            {trailingMeta ? <div className="line-clamp-1 text-xs text-[var(--agri-text-muted)]">{trailingMeta}</div> : null}
          </div>
        ) : null}
      </div>

      {quickMenu && quickActions.length > 0 ? (
        <>
          <button
            type="button"
            aria-label="Inchide meniul rapid"
            className="fixed inset-0 z-[100000150] bg-transparent"
            onClick={closeQuickMenu}
          />
          <div
            className="fixed z-[100000151] min-w-[170px] rounded-xl border border-[var(--agri-border)] bg-white p-1.5 shadow-xl transition-transform duration-150"
            style={{
              left: Math.max(8, Math.min(window.innerWidth - 188, quickMenu.x - 80)),
              top: Math.max(8, quickMenu.y - 12),
            }}
          >
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.key}
                  type="button"
                  className={cn('flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-slate-50', action.className)}
                  onClick={() => {
                    action.onClick()
                    closeQuickMenu()
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              )
            })}
          </div>
        </>
      ) : null}

      {touchEnabled && !quickMenu ? (
        <div className="pointer-events-none mt-1 text-[10px] font-medium text-[var(--agri-text-muted)]">
          Gliseaza stanga/dreapta sau tine apasat pentru actiuni
        </div>
      ) : null}
    </article>
  )
}
