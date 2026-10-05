// MuneebOS monogram, used where macOS would show its logo.
export function MuneebLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm-5 15.25V7.5h1.9l3.1 4.3 3.1-4.3H17v9.25h-2.1v-5.9l-2.9 4-2.9-4v5.9H7Z" />
    </svg>
  );
}
