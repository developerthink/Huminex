import React from 'react'

const AudioVisual = ({canvasRef}: {canvasRef: React.RefObject<HTMLCanvasElement | null>}) => {
  return (
    <div className="w-full  bg-primary border-r grid place-items-center">
    <svg
      className="absolute z-10 inset-0 w-full h-full"
      viewBox="0 0 390 299"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.2" filter="url(#filter0_ddf_1326_7199)">
        <ellipse  
          cx="193"
          cy="149.345"
          rx="215"
          ry="103.345"
          fill="url(#paint0_linear_1326_7199)"
        />
      </g>
      <defs>
        <filter
          id="filter0_ddf_1326_7199"
          x="-67.7005"
          y="0.299519"
          width="521.401"
          height="298.092"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="3.11594" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.919565 0 0 0 0 0.75 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1326_7199"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-2.07729" />
          <feGaussianBlur stdDeviation="3.11594" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.919565 0 0 0 0 0.75 0 0 0 0.6 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_1326_7199"
            result="effect2_dropShadow_1326_7199"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_1326_7199"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="22.8502"
            result="effect3_foregroundBlur_1326_7199"
          />
        </filter>
        <linearGradient
          id="paint0_linear_1326_7199"
          x1="193"
          y1="46"
          x2="193"
          y2="252.691"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F0E5D7" stopOpacity="0" />
          <stop offset="0.34601" stopColor="#F0E5D7" />
          <stop offset="0.825176" stopColor="#CFA958" />
          <stop offset="1" stopColor="#CFA958" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  </div>
  )
}

export default AudioVisual