import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Vercel Analytics + Speed Insights for Core Web Vitals monitoring.
// Both components are lightweight and deferred automatically.
export function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
