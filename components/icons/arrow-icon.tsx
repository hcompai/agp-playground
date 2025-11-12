export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <g filter="url(#filter0_d_72_91)">
        <path
          d="M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 5.41418V17.4142L11 14.4142L13.5 19.4142C13.5 19.4142 14.1763 19.63 14.5 19.4142C14.8237 19.1984 15.1457 18.7638 15 18.4142C14.3123 16.7638 12.5 13.4142 12.5 13.4142H16L8 5.41418Z"
          fill="black"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_72_91"
          x="5.2"
          y="2.2"
          width="15.0142"
          height="21.1785"
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
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.9" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_72_91"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_72_91"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
