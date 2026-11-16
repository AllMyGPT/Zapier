import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

interface Crumb {
  name: string
  url: string
}

interface BreadcrumbsProps {
  crumbs: Crumb[]
  className?: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export function Breadcrumbs({ crumbs, className = '' }: BreadcrumbsProps) {
  const allCrumbs = [{ name: 'Inicio', url: SITE_URL }, ...crumbs]

  return (
    <>
      <BreadcrumbJsonLd crumbs={allCrumbs} />
      <nav aria-label="Breadcrumb" className={`px-4 py-3 ${className}`}>
        <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 text-sm text-gray-500">
          {allCrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-gray-300">
                  /
                </span>
              )}
              {i === allCrumbs.length - 1 ? (
                <span aria-current="page" className="font-medium text-gray-700 truncate max-w-[200px]">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="hover:text-blue-600 transition-colors truncate max-w-[200px]"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
