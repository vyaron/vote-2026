// Auth is handled by middleware — this layout is a thin pass-through.
// Individual pages do their own data fetching.
export default function MkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
