export function StatusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <circle cx="10" cy="10" r="4" fill="currentColor" />
    </svg>
  )
}
