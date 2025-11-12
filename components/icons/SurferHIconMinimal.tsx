export default function HIconMinimal({
  className = "",
  width = 28,
  height = 16,
}: {
  className?: string
  width?: number
  height?: number
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 36 20"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_surfer_h_minimal)">
        <path
          d="M6.17474 6.82242H-0.105469V13.1026H6.17474V19.3808H12.455V13.1026V6.82242V0.542282H6.17474V6.82242Z"
          fill="currentColor"
        />
        <path
          d="M25.7864 19.9981C31.309 19.9981 35.7854 15.5214 35.7854 9.99908C35.7854 4.47675 31.309 1.52588e-05 25.7864 1.52588e-05C20.2637 1.52588e-05 15.7874 4.47675 15.7874 9.99908C15.7874 15.5214 20.2637 19.9981 25.7864 19.9981Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_surfer_h_minimal">
          <rect width="36" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
