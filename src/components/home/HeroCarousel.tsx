
import {
  useRef,
  useState,
  type PointerEvent,
} from "react"

import { heroSlides } from "@/data/hero-slides"
import { MonkeyArtwork } from "./MonkeyArtwork"

const SWIPE_THRESHOLD = 60

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const pointerStart = useRef<{
    x: number
    y: number
    id: number
  } | null>(null)

  const activeSlide = heroSlides[activeIndex]

  function goToSlide(index: number) {
    const total = heroSlides.length

    setActiveIndex(
      (index + total) % total
    )
    setDragOffset(0)
  }

  function handlePointerDown(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return
    }

    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    }

    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    const start = pointerStart.current

    if (!start || start.id !== event.pointerId) {
      return
    }

    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      setDragOffset(distanceX)
    }
  }

  function finishDrag(
    event: PointerEvent<HTMLDivElement>
  ) {
    const start = pointerStart.current

    if (!start || start.id !== event.pointerId) {
      return
    }

    const distanceX = event.clientX - start.x

    pointerStart.current = null
    setIsDragging(false)
    setDragOffset(0)

    if (distanceX < -SWIPE_THRESHOLD) {
      goToSlide(activeIndex + 1)
    } else if (distanceX > SWIPE_THRESHOLD) {
      goToSlide(activeIndex - 1)
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function cancelDrag() {
    pointerStart.current = null
    setIsDragging(false)
    setDragOffset(0)
  }

  return (
    <section
      id="inicio"
      aria-label="Destaques da Kurio"
      aria-roledescription="carrossel"
      className="w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={[
            "grid select-none items-center gap-8 cursor-default",
            "min-h-[680px] py-8",
            "sm:min-h-[740px]",
            "md:h-[520px] md:min-h-0 md:grid-cols-[1.2fr_1fr] md:gap-14 md:py-10",
            "lg:h-[580px]",
            ].join(" ")}
          style={{
            touchAction: "pan-y",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={cancelDrag}
        >
          {/* Conteúdo */}
          <div
            className="flex min-w-0 flex-col items-start md:h-full md:justify-center"
            style={{
              transform: `translateX(${Math.max(-24, Math.min(24, dragOffset * 0.12))}px)`,
              transition: isDragging
                ? "none"
                : "transform 250ms ease",
            }}
          >
            <p className="mb-5 font-mono text-xs tracking-[0.12em] text-foreground sm:text-sm">
              {activeSlide.eyebrow}
            </p>

            <h1 className="max-w-[650px] whitespace-pre-line font-mono text-[clamp(1.75rem,3.5vw,3.5rem)] font-bold leading-[1.2] tracking-tight text-foreground">
              {activeSlide.title}
            </h1>

            <p className="mt-4 max-w-[540px] font-mono text-xs leading-6 text-kurio-text-secondary sm:text-sm">
              {activeSlide.description}
            </p>

            <a
              href={activeSlide.href}
              onPointerDown={(event) => event.stopPropagation()}
              className="mt-7 inline-flex min-h-10 items-center justify-center rounded-md bg-kurio-primary px-7 font-mono text-xs font-bold text-kurio-ink transition-colors hover:bg-kurio-primary-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-kurio-primary"
            >
              {activeSlide.buttonLabel}
            </a>

            {/* Indicadores */}
            <div
              className="mt-8 flex w-full items-center justify-center gap-0.5 md:mt-10 md:justify-end"
              role="group"
              aria-label="Selecionar destaque"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ir para destaque ${index + 1}: ${slide.eyebrow}`}
                  aria-current={
                    index === activeIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() => goToSlide(index)}
                  className="flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kurio-primary"
                >
                  <span
                    className={[
                      "block size-2 rounded-full transition-all duration-200",
                      index === activeIndex
                        ? "scale-110 bg-kurio-primary"
                        : "bg-kurio-primary/65 hover:bg-kurio-primary",
                    ].join(" ")}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Arte */}
          <div
            className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-[22px] bg-kurio-card"
            style={{
              transform: `translateX(${Math.max(-32, Math.min(32, dragOffset * 0.2))}px)`,
              transition: isDragging
                ? "none"
                : "transform 250ms ease",
            }}
          >
            <MonkeyArtwork variant={activeSlide.artwork} />
          </div>
        </div>

        <p
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          Destaque {activeIndex + 1} de {heroSlides.length}:
          {" "}
          {activeSlide.eyebrow}
        </p>
      </div>
    </section>
  )
}
