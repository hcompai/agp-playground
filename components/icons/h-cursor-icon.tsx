export default function HCursorIcon({
  className = "",
  top = "0",
  left = "0",
  transitionDuration = "0.5s",
  transitionTiming = "ease",
}: {
  className?: string
  top?: string
  left?: string
  transitionDuration?: string
  transitionTiming?: string
}) {
  return (
    <svg
      className={className}
      width="43"
      height="40"
      viewBox="0 0 43 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        transition: `left ${transitionDuration} ${transitionTiming}, top ${transitionDuration} ${transitionTiming}`,
        top,
        left,
        marginLeft: "-4px",
        marginTop: "-3px",
      }}
    >
      <g filter="url(#filter0_d_1608_25197)">
        <path
          d="M7.68749 16.5142L5.42791 5.15177C5.26065 4.31067 6.16027 3.66301 6.90484 4.08848L16.8788 9.78786C17.6558 10.2319 17.503 11.3948 16.6376 11.623L12.3849 12.7447C12.1377 12.8098 11.9249 12.9672 11.7902 13.1844L9.51802 16.8464C9.03968 17.6174 7.86445 17.4041 7.68749 16.5142Z"
          fill="currentColor"
        />
        <path
          d="M4.93751 5.24929L7.19709 16.6118C7.46253 17.9466 9.22538 18.2664 9.94288 17.11L12.215 13.448C12.2824 13.3394 12.3888 13.2607 12.5124 13.2281L16.7651 12.1065C18.0632 11.7642 18.2924 10.0198 17.1268 9.35374L7.15291 3.65436C6.03605 3.01615 4.68662 3.98765 4.93751 5.24929Z"
          stroke="white"
          strokeLinecap="square"
        />
      </g>
      <g filter="url(#filter1_d_1608_25197)">
        <rect
          x="14"
          y="15"
          width="25"
          height="20"
          rx="10"
          fill="currentColor"
        />
        <path
          d="M23.2969 29V21H24.5039V24.4766H28.4922V21H29.7031V29H28.4922V25.5117H24.5039V29H23.2969Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1608_25197"
          x="0.588068"
          y="0.406023"
          width="21.6129"
          height="23.0052"
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
          <feOffset dy="1.27273" />
          <feGaussianBlur stdDeviation="1.90909" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1608_25197"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1608_25197"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_1608_25197"
          x="10"
          y="12"
          width="33"
          height="28"
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
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1608_25197"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1608_25197"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
