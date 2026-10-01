/** First stop for keyboard users: jump past the header straight to the page. */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-pill focus:border focus:border-carbon focus:bg-sun focus:px-4 focus:py-2.5 focus:type-label focus:text-carbon"
    >
      Skip to content
    </a>
  );
}
