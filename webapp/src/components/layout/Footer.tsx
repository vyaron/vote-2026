import Link from 'next/link';
import { Heart } from 'lucide-react';
import { SITE_NAME, NAV_ITEMS } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">כ</span>
              </div>
              <span className="font-bold text-xl">{SITE_NAME}</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              מידע מקיף על חברי הכנסת ה-25 של ישראל. 
              כל המידע מגיע ממקורות רשמיים ומתעדכן באופן שוטף.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">ניווט מהיר</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">מקורות</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://knesset.gov.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  אתר הכנסת הרשמי
                </a>
              </li>
              <li>
                <a
                  href="https://main.knesset.gov.il/Activity/Info/Pages/Databases.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  מאגרי המידע של הכנסת
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {SITE_NAME}. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              נבנה עם <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
