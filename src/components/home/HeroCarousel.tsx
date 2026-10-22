
import {
  useRef,
  useState,
  type PointerEvent,
} from "react"

import { heroSlides } from "@/data/hero-slides"

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
    setActiveIndex((index + total) % total)
    setDragOffset(0)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
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

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current

    if (!start || start.id !== event.pointerId) return

    const distanceX = event.clientX - start.x
    const distanceY = event.clientY - start.y

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      setDragOffset(distanceX)
    }
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current

    if (!start || start.id !== event.pointerId) return

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

  const titleParts = activeSlide.title.split("\n")

  return (
    <section
      id="inicio"
      aria-label="Destaques da Kurio"
      aria-roledescription="carrossel"
      className="w-full"
    >
      <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-8 lg:px-12 xl:px-[85px]">


        {/* MOBILE: banner do Figma */}
        <div
          className="relative mt-4 h-[220px] w-full select-none overflow-hidden rounded-[28px] border-kurio-border/30 md:hidden"
          style={{
            background:
              "linear-gradient(115deg, #6D482F 0%, #422A1E 48%, #261A14 100%)",
            touchAction: "pan-y",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={cancelDrag}
        >
          {/* Círculo esquerdo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-[248px] w-[248px] rounded-full"
            style={{
              top: "-31px",
              left: "-80px",
              background:
                "linear-gradient(160.25deg, rgba(221,154,95,0.43) 22.1%, rgba(210,138,76,0.04) 87.42%)",
            }}
          />

          {/* Círculo central */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-[248px] w-[248px] rounded-full"
            style={{
              top: "-10px",
              left: "73px",
              background:
                "linear-gradient(160.25deg, rgba(221,154,95,0.37) 22.1%, rgba(210,138,76,0) 87.42%)",
            }}
          />


          {/* Conteúdo à esquerda — MOBILE */}
          <div className="absolute inset-y-0 left-0 z-20 flex w-[59%] min-w-0 flex-col items-start px-4 pt-4">
            <p className="font-sans! !text-[10px] !font-semibold !leading-[14px] text-[#F2E6D6]">
              {activeSlide.eyebrow}
            </p>

            <h1 className="mt-3 w-full max-w-full font-sans! !text-[15px] !font-bold !leading-[20px] !tracking-normal text-[#F2E6D6]">
              {activeSlide.id === "future" ? (
                <>
                  <span className="block">SEJA DONO DA</span>
                  <span className="block">CULTURA DIGITAL</span>
                </>
              ) : (
                activeSlide.title.split("\n").map((part, index) => (
                  <span key={index} className="block">
                    {part}
                  </span>
                ))
              )}
            </h1>

            <p className="mt-3 w-full max-w-[175px] font-sans! !text-[10px] !leading-[15px] !tracking-normal text-[#D1AF8E]">
              {activeSlide.id === "future"
                ? "Descubra NFTs selecionados de criadores do mundo todo."
                : activeSlide.description}
            </p>

            <a
              href={activeSlide.href}
              onPointerDown={(event) => event.stopPropagation()}
              className="mt-auto mb-7 inline-flex items-center gap-2 font-sans! !text-[11px] !font-bold !leading-[15px] text-kurio-primary"
            >
              {activeSlide.buttonLabel}

              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          </div>


          {/* Imagem principal e macaco secundário */}
          <div className="pointer-events-none absolute right-3 top-[14px] z-10 h-[164px] w-[43%]">
            <img
              src={activeSlide.artwork}
              alt={`Arte em destaque: ${activeSlide.eyebrow}`}
              draggable={false}
              className="h-full w-full rounded-[22px] object-cover"
            />

            <img
              src="/images/nfts/macaco-cinza.png"
              alt="Arte em destaque: Bem-vindo à Kurio"
              aria-hidden="true"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              draggable={false}
              className="absolute -bottom-2 -left-4 h-[62px] w-[62px] rounded-[18px] object-cover"
            />
          </div>

          {/* Indicadores centralizados e próximos */}
          <div
            className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5"
            role="group"
            aria-label="Selecionar destaque"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir para destaque ${index + 1}: ${slide.eyebrow}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => goToSlide(index)}
                className="flex h-5 w-5 items-center justify-center focus-visible:outline-2 focus-visible:outline-kurio-primary"
              >
                <span
                  className={[
                    "h-[7px] w-[7px] rounded-full",
                    index === activeIndex
                      ? "bg-kurio-primary"
                      : "bg-kurio-primary/60",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>
        </div>


        {/* DESKTOP: estrutura original preservada */}
        <div
          className={[
            "hidden select-none items-center gap-10",
            "py-12 md:grid",
            "lg:min-h-[690px] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]",
            "lg:justify-between lg:gap-8 lg:py-14",
          ].join(" ")}
          style={{ touchAction: "pan-y" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={cancelDrag}
        >
          <div
            className="flex min-w-0 flex-col items-start text-left"
            style={{
              transform: `translateX(${Math.max(
                -24,
                Math.min(24, dragOffset * 0.12)
              )}px)`,
              transition: isDragging
                ? "none"
                : "transform 250ms ease",
            }}
          >
            <p
              className="mb-6 font-sans! text-[12px] leading-[16px] tracking-[3px]"
              style={{ color: "#AA947F" }}
            >
              {activeSlide.eyebrow.toUpperCase()}
            </p>

            <h1
              className={[
                "w-full max-w-[700px] font-sans! font-bold uppercase",
                "text-[clamp(30px,4vw,48px)]",
                "leading-[1.15] tracking-[1.2px]",
              ].join(" ")}
              style={{ color: "#F2E6D6" }}
            >
              {titleParts.map((part, index) => (
                <span
                  key={`${activeSlide.id}-${index}`}
                  className="block"
                >
                  {index === 1 && activeSlide.id === "future" ? (
                    <>
                      DA{" "}
                      <span className="text-kurio-primary">
                        ARTE DIGITAL
                      </span>
                    </>
                  ) : (
                    part
                  )}
                </span>
              ))}
            </h1>

            <p
              className="mt-6 w-full max-w-[590px] font-sans! text-[14px] leading-[22px] tracking-normal"
              style={{ color: "#AA947F" }}
            >
              {activeSlide.description}
            </p>

            <a
              href={activeSlide.href}
              onPointerDown={(event) => event.stopPropagation()}
              className={[
                "mt-8 inline-flex h-[40px] min-w-[139px]",
                "items-center justify-center gap-3",
                "rounded-[7px] bg-kurio-primary px-5",
                "font-sans! text-[12px] font-bold",
                "leading-[16px] tracking-[1.2px]",
                "text-kurio-ink transition-colors",
                "hover:bg-kurio-primary-light",
                "focus-visible:outline-2",
                "focus-visible:outline-offset-4",
                "focus-visible:outline-kurio-primary",
              ].join(" ")}
            >
              {activeSlide.buttonLabel}

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>

            <div
              className="mt-10 flex items-center gap-2"
              role="group"
              aria-label="Selecionar destaque"
              onPointerDown={(event) => event.stopPropagation()}
            >
              {heroSlides.map((slide, index) => {
                const isActive = index === activeIndex

                return (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Ir para destaque ${index + 1}: ${slide.eyebrow}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goToSlide(index)}
                    className={[
                      "flex h-6 items-center justify-center",
                      "focus-visible:outline-2",
                      "focus-visible:outline-offset-2",
                      "focus-visible:outline-kurio-primary",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "block h-[6px] rounded-full",
                        "transition-all duration-300",
                        isActive
                          ? "w-[24px] bg-kurio-primary"
                          : "w-[6px] bg-kurio-primary/40 hover:bg-kurio-primary/70",
                      ].join(" ")}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <div
            className="relative isolate mx-auto w-full max-w-[537px]"
            style={{
              transform: `translateX(${Math.max(
                -32,
                Math.min(32, dragOffset * 0.2)
              )}px)`,
              transition: isDragging
                ? "none"
                : "transform 250ms ease",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -z-10"
              style={{
                inset: "-220px 0",
                background:
                  "radial-gradient(ellipse at center, rgba(219, 145, 82, 0.18) 0%, rgba(219, 145, 82, 0.10) 28%, rgba(219, 145, 82, 0.04) 48%, transparent 72%)",
                filter: "blur(65px)",
              }}
            />

            <div className="relative aspect-square w-full overflow-hidden rounded-[22px]">
              <img
                key={activeSlide.artwork}
                src={activeSlide.artwork}
                alt={`Arte em destaque: ${activeSlide.eyebrow}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        <p
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          Destaque {activeIndex + 1} de {heroSlides.length}:{" "}
          {activeSlide.eyebrow}
        </p>
      </div>
    </section>
  )
}
