
type MonkeyArtworkProps = {
  variant: "emerald" | "violet" | "gold"
}

const themes = {
  emerald: {
    background: "#DDD9AE",
    halo: "#BFC7A0",
    jacket: "#17694E",
    jacketDark: "#104533",
    accent: "#D28A4C",
    fur: "#955027",
  },
  violet: {
    background: "#E8DFC1",
    halo: "#C9C7B3",
    jacket: "#795CA0",
    jacketDark: "#594477",
    accent: "#D8B5ED",
    fur: "#786456",
  },
  gold: {
    background: "#E5D5B1",
    halo: "#C6B991",
    jacket: "#C68A40",
    jacketDark: "#9C642C",
    accent: "#E8C889",
    fur: "#A76B32",
  },
}

export function MonkeyArtwork({
  variant,
}: MonkeyArtworkProps) {
  const theme = themes[variant]

  return (
    <svg
      viewBox="0 0 500 500"
      role="img"
      aria-label="Ilustração fictícia de um macaco colecionável"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id={`bg-${variant}`}>
          <stop offset="0%" stopColor="#F5F0D5" />
          <stop
            offset="100%"
            stopColor={theme.background}
          />
        </radialGradient>

        <linearGradient
          id={`jacket-${variant}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={theme.jacket}
          />
          <stop
            offset="100%"
            stopColor={theme.jacketDark}
          />
        </linearGradient>
      </defs>

      <rect
        width="500"
        height="500"
        fill={`url(#bg-${variant})`}
      />

      <circle
        cx="265"
        cy="255"
        r="192"
        fill={theme.halo}
        opacity="0.45"
      />

      {/* Corpo e jaqueta */}
      <path
        d="M65 500 C85 393 143 365 205 358
           L302 358 C375 363 425 407 444 500Z"
        fill={`url(#jacket-${variant})`}
      />

      <path
        d="M120 500 L148 396 L202 367
           L223 500Z"
        fill="#EEE2C8"
      />

      <path
        d="M381 500 L356 396 L306 367
           L290 500Z"
        fill="#EEE2C8"
      />

      {/* Pescoço */}
      <path
        d="M207 335 L209 400 Q252 434 298 397
           L298 328Z"
        fill={theme.fur}
      />

      {/* Orelhas */}
      <ellipse
        cx="135"
        cy="233"
        rx="54"
        ry="69"
        fill={theme.fur}
      />
      <ellipse
        cx="135"
        cy="237"
        rx="31"
        ry="44"
        fill="#D79A66"
      />

      <ellipse
        cx="365"
        cy="233"
        rx="54"
        ry="69"
        fill={theme.fur}
      />
      <ellipse
        cx="365"
        cy="237"
        rx="31"
        ry="44"
        fill="#D79A66"
      />

      {/* Cabeça */}
      <ellipse
        cx="250"
        cy="226"
        rx="126"
        ry="156"
        fill={theme.fur}
      />

      {/* Cabelo */}
      <path
        d="M138 165 Q148 82 224 72
           Q280 31 333 83
           Q360 105 369 163
           Q334 120 303 120
           Q264 95 224 135
           Q176 116 138 165Z"
        fill="#65351D"
      />

      <path
        d="M196 91 Q231 51 278 49
           Q256 67 250 91Z"
        fill="#65351D"
      />

      {/* Região dos olhos */}
      <ellipse
        cx="205"
        cy="217"
        rx="60"
        ry="65"
        fill="#C88855"
      />
      <ellipse
        cx="294"
        cy="217"
        rx="60"
        ry="65"
        fill="#C88855"
      />

      {/* Óculos */}
      <circle
        cx="203"
        cy="205"
        r="49"
        fill="#E6D9B4"
        stroke="#D8B36D"
        strokeWidth="12"
      />
      <circle
        cx="296"
        cy="205"
        r="49"
        fill="#E6D9B4"
        stroke="#D8B36D"
        strokeWidth="12"
      />

      <circle
        cx="203"
        cy="205"
        r="37"
        fill="#174C3C"
      />
      <circle
        cx="296"
        cy="205"
        r="37"
        fill="#174C3C"
      />

      <path
        d="M247 197 Q250 190 253 197"
        stroke="#D8B36D"
        strokeWidth="10"
        fill="none"
      />

      <path
        d="M155 198 L117 190 M344 198 L381 190"
        stroke="#D8B36D"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Focinho */}
      <ellipse
        cx="251"
        cy="296"
        rx="99"
        ry="70"
        fill="#DDAA78"
      />

      <ellipse
        cx="251"
        cy="259"
        rx="48"
        ry="31"
        fill="#E5B88B"
      />

      <ellipse
        cx="235"
        cy="256"
        rx="8"
        ry="5"
        fill="#754A32"
      />
      <ellipse
        cx="268"
        cy="256"
        rx="8"
        ry="5"
        fill="#754A32"
      />

      <path
        d="M197 314 Q252 342 308 310"
        stroke="#754A32"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Detalhes da jaqueta */}
      <path
        d="M203 368 L250 412 L301 368"
        stroke={theme.accent}
        strokeWidth="8"
        fill="none"
      />

      <path
        d="M250 413 L250 500"
        stroke={theme.accent}
        strokeWidth="5"
      />

      <circle
        cx="250"
        cy="446"
        r="8"
        fill={theme.accent}
      />
    </svg>
  )
}
