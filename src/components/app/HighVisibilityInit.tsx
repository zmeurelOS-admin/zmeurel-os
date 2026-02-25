'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'agri.highVisibility'

export function HighVisibilityInit() {
  useEffect(() => {
    const enabled = window.localStorage.getItem(STORAGE_KEY) === '1'
    document.documentElement.classList.toggle('high-visibility-mode', enabled)
  }, [])

  return null
}
