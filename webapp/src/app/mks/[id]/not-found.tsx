import Link from 'next/link';

export default function MkNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">חבר כנסת לא נמצא</h2>
        <p className="text-muted-foreground mb-8">
          לא הצלחנו למצוא את חבר הכנסת שחיפשת
        </p>
        <Link
          href="/mks"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          צפו בכל חברי הכנסת
        </Link>
      </div>
    </div>
  );
}
