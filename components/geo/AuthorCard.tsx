import Image from 'next/image'

interface AuthorCardProps {
  name: string
  title?: string | null
  bio?: string | null
  imageUrl?: string | null
  reviewedBy?: string | null
  className?: string
}

// E-E-A-T author card — signals expertise, experience, authority, trustworthiness.
// Used as itemscope/itemtype for Person schema inline signal.
export function AuthorCard({
  name,
  title,
  bio,
  imageUrl,
  reviewedBy,
  className = '',
}: AuthorCardProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 ${className}`}
      itemScope
      itemType="https://schema.org/Person"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={`Foto de ${name}`}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
          itemProp="image"
        />
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Escrito por
        </p>
        <p className="font-bold text-gray-900" itemProp="name">
          {name}
        </p>
        {title && (
          <p className="text-sm text-blue-600" itemProp="jobTitle">
            {title}
          </p>
        )}
        {bio && (
          <p className="mt-1 text-sm text-gray-600" itemProp="description">
            {bio}
          </p>
        )}
        {reviewedBy && (
          <p className="mt-2 text-xs text-gray-400">
            Revisado por: <span className="font-medium text-gray-600">{reviewedBy}</span>
          </p>
        )}
      </div>
    </div>
  )
}
