
const skeletonItems = Array.from({ length: 6 }, (_, index) => index)

const shimmer =
  "relative overflow-hidden bg-kurio-raised " +
  "before:pointer-events-none before:absolute before:inset-0 " +
  "before:-translate-x-full " +
  "before:bg-[linear-gradient(110deg,transparent_20%,rgba(210,138,76,0.14)_45%,rgba(255,225,190,0.09)_50%,transparent_80%)] " +
  "before:animate-[kurio-shimmer_1.8s_ease-in-out_infinite] " +
  "motion-reduce:before:animate-none"

export function CatalogSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando NFTs"
      aria-busy="true"
    >
      <span className="sr-only">Carregando catálogo de NFTs...</span>

      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-3"
      >
        {skeletonItems.map((index) => (
          <div key={index} className="min-w-0">
            <div className="rounded-[16px] border border-kurio-border bg-kurio-card p-4">
              <div
                className={`aspect-square rounded-[8px] border border-white/10 ${shimmer}`}
              />
            </div>

            <div className="space-y-2 pt-3">
              <div
                className={`h-4 w-[78%] rounded-md ${shimmer}`}
              />

              <div
                className={`h-4 w-[42%] rounded-md ${shimmer}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
