'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onEscape?: () => void
  onTab?: () => void
  onShiftTab?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onSpace?: () => void
  onDelete?: () => void
  onSave?: () => void
  onCancel?: () => void
  enabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    onEnter,
    onEscape,
    onTab,
    onShiftTab,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onSpace,
    onDelete,
    onSave,
    onCancel,
    enabled = true
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Prevent default behavior for handled keys
    const handledKeys = [
      'Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 
      'ArrowLeft', 'ArrowRight', 'Space', 'Delete',
      's', 'c' // Save and Cancel shortcuts
    ]

    if (handledKeys.includes(event.key)) {
      event.preventDefault()
    }

    switch (event.key) {
      case 'Enter':
        onEnter?.()
        break
      case 'Escape':
        onEscape?.()
        break
      case 'Tab':
        if (event.shiftKey) {
          onShiftTab?.()
        } else {
          onTab?.()
        }
        break
      case 'ArrowUp':
        onArrowUp?.()
        break
      case 'ArrowDown':
        onArrowDown?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
      case ' ':
        onSpace?.()
        break
      case 'Delete':
        onDelete?.()
        break
      case 's':
        if (event.ctrlKey || event.metaKey) {
          onSave?.()
        }
        break
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          onCancel?.()
        }
        break
    }
  }, [
    enabled, onEnter, onEscape, onTab, onShiftTab, onArrowUp, 
    onArrowDown, onArrowLeft, onArrowRight, onSpace, onDelete, 
    onSave, onCancel
  ])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return { handleKeyDown }
}

// Table-specific keyboard navigation
export function useTableNavigation(
  rowCount: number,
  columnCount: number,
  onNavigate?: (row: number, column: number) => void
) {
  const [currentRow, setCurrentRow] = useState(0)
  const [currentColumn, setCurrentColumn] = useState(0)

  const navigate = useCallback((row: number, column: number) => {
    const newRow = Math.max(0, Math.min(row, rowCount - 1))
    const newColumn = Math.max(0, Math.min(column, columnCount - 1))
    
    setCurrentRow(newRow)
    setCurrentColumn(newColumn)
    onNavigate?.(newRow, newColumn)
  }, [rowCount, columnCount, onNavigate])

  useKeyboardNavigation({
    onArrowUp: () => navigate(currentRow - 1, currentColumn),
    onArrowDown: () => navigate(currentRow + 1, currentColumn),
    onArrowLeft: () => navigate(currentRow, currentColumn - 1),
    onArrowRight: () => navigate(currentRow, currentColumn + 1),
    onEnter: () => {
      // Focus the current cell
      const cell = document.querySelector(
        `[data-row="${currentRow}"][data-column="${currentColumn}"] input`
      ) as HTMLInputElement
      cell?.focus()
    }
  })

  return { currentRow, currentColumn, navigate }
}

// Form-specific keyboard navigation
export function useFormNavigation(
  fieldCount: number,
  onSave?: () => void,
  onCancel?: () => void
) {
  const [currentField, setCurrentField] = useState(0)

  const navigateToField = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, fieldCount - 1))
    setCurrentField(newIndex)
    
    // Focus the field
    const field = document.querySelector(
      `[data-field-index="${newIndex}"] input, [data-field-index="${newIndex}"] textarea`
    ) as HTMLInputElement | HTMLTextAreaElement
    field?.focus()
  }, [fieldCount])

  useKeyboardNavigation({
    onTab: () => navigateToField(currentField + 1),
    onShiftTab: () => navigateToField(currentField - 1),
    onEnter: () => {
      // Move to next field or save if at end
      if (currentField < fieldCount - 1) {
        navigateToField(currentField + 1)
      } else {
        onSave?.()
      }
    },
    onEscape: onCancel,
    onSave,
    onCancel
  })

  return { currentField, navigateToField }
}

// Bulk selection keyboard navigation
export function useBulkSelection(
  itemCount: number,
  selectedItems: Set<string>,
  onToggleSelection: (index: number) => void,
  onSelectAll: () => void,
  onDeselectAll: () => void
) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const navigateToItem = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, itemCount - 1))
    setCurrentIndex(newIndex)
  }, [itemCount])

  useKeyboardNavigation({
    onArrowUp: () => navigateToItem(currentIndex - 1),
    onArrowDown: () => navigateToItem(currentIndex + 1),
    onSpace: () => onToggleSelection(currentIndex),
    onEnter: () => onToggleSelection(currentIndex),
    onEscape: () => {
      // Select all or deselect all based on current selection
      if (selectedItems.size === itemCount) {
        onDeselectAll()
      } else {
        onSelectAll()
      }
    }
  })

  return { currentIndex, navigateToItem }
}

// Accessibility helpers
export function useAccessibility() {
  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    element?.focus()
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return { announceToScreenReader, focusElement, trapFocus }
}
