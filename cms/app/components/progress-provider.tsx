"use client"

import { AppProgressBar } from 'next-nprogress-bar'
import * as React from "react"

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppProgressBar
        height="4px"
        color="#000000"
        options={{ showSpinner: true }}
        shallowRouting
      />
      {children}
    </>
  )
} 