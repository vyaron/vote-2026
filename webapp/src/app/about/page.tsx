'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Users, Building, Scale, Heart, Mail } from 'lucide-react';
import { GithubIcon } from '@/components/icons/SocialIcons';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/banner.jpg"
          alt="הכנסת"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container relative z-10 text-center text-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
            >
              אודות הפרויקט
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-white/80 max-w-2xl mx-auto"
            >
              מידע שקוף ונגיש על נבחרי הציבור שלנו
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                המטרה שלנו
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  הדמוקרטיה הישראלית מבוססת על שקיפות ומעורבות אזרחית. 
                  אנחנו מאמינים שכל אזרח זכאי לגישה קלה ונוחה למידע על נבחרי הציבור שלו.
                </p>
                <p>
                  הפרויקט הזה נוצר כדי לספק פלטפורמה מודרנית, נגישה ומעוצבת היטב 
                  שמציגה מידע מקיף על כל 120 חברי הכנסת.
                </p>
                <p>
                  כל המידע באתר מגיע ממקורות רשמיים ומתעדכן באופן שוטף.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/Knesset1.png"
                  alt="בניין הכנסת"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary/10 rounded-xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              מה תמצאו באתר
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              כלים ומידע שיעזרו לכם להכיר את נבחרי הציבור
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: Users,
                title: 'פרופילים מלאים',
                description: 'מידע מקיף על כל חבר כנסת - ביוגרפיה, תמונות, פרטי קשר ורשתות חברתיות',
              },
              {
                icon: Building,
                title: 'מידע על סיעות',
                description: 'סקירה של כל הסיעות בכנסת, מספר המנדטים וחברי הכנסת בכל סיעה',
              },
              {
                icon: Scale,
                title: 'השוואה בין ח"כים',
                description: 'כלי להשוואה בין חברי כנסת שונים - השכלה, ניסיון ותפקידים',
              },
              {
                icon: Heart,
                title: 'עיצוב מודרני',
                description: 'ממשק משתמש נקי ונוח, מותאם לנייד ונגיש לכל',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="bg-card rounded-2xl p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-6">
              מקורות המידע
            </motion.h2>
            <motion.div variants={fadeInUp} className="space-y-4 text-lg text-muted-foreground">
              <p>
                כל המידע באתר נאסף ממקורות רשמיים ופומביים:
              </p>
              <ul className="text-right space-y-2 inline-block">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  אתר הכנסת הרשמי (knesset.gov.il)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  ממשק ה-API הפתוח של הכנסת
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  דפי הרשתות החברתיות הרשמיים של חברי הכנסת
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              מוכנים להתחיל?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              גלו מידע מקיף על כל חברי הכנסת ה-25
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/mks"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-colors group"
              >
                צפו בחברי הכנסת
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/parties"
                className="inline-flex items-center gap-2 bg-card border px-8 py-4 rounded-full font-medium text-lg hover:bg-muted transition-colors"
              >
                צפו בסיעות
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact/Credits Section */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-6">
              יצירת קשר
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground mb-6">
              מצאתם טעות? יש לכם הצעות לשיפור? נשמח לשמוע מכם!
            </motion.p>
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
              <a
                href="mailto:contact@example.com"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                צרו קשר
              </a>
              <a
                href="https://github.com/vyaron/vote-2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
                GitHub
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
