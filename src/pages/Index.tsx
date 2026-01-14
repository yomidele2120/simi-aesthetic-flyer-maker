import lashesImage from "@/assets/lashes-1.jpg";
import browsImage from "@/assets/brows-1.jpg";
import tattoo1Image from "@/assets/tattoo-1.jpg";
import tattoo2Image from "@/assets/tattoo-2.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/30 clip-diagonal" />
      <div className="absolute bottom-20 right-10 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="text-rose-gold">
          <path d="M50 10 Q60 30 80 40 Q60 50 50 90 Q40 50 20 40 Q40 30 50 10" fill="currentColor" opacity="0.3"/>
        </svg>
      </div>
      
      {/* Main Flyer Container */}
      <div className="relative z-10 max-w-lg mx-auto px-6 py-8">
        
        {/* Header with Brand Name */}
        <header className="text-center mb-6">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Simi <span className="text-rose-gold italic">Aesthetic</span>
          </h1>
          <p className="font-elegant text-base italic text-muted-foreground mt-3 leading-relaxed">
            Welcome to Simi Aesthetic, where beauty meets art!<br/>
            Treat yourself to a luxurious experience with our beauty services.
          </p>
        </header>

        {/* Floating Images - Top Right */}
        <div className="absolute top-20 right-4 md:right-8 z-20">
          <div className="relative">
            <img 
              src={lashesImage} 
              alt="Lash extensions"
              className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border-3 border-rose-gold shadow-elegant"
            />
          </div>
        </div>

        {/* Services Content */}
        <main className="space-y-6 mt-4">
          
          {/* Lash Extension Section */}
          <section>
            <div className="inline-block bg-secondary/80 px-4 py-1 rounded mb-3">
              <h2 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground">
                Lash Extension
              </h2>
            </div>
            <div className="space-y-1.5 font-body text-sm pl-1">
              <div className="flex justify-between">
                <span>Classic Set</span>
                <span className="text-rose-gold font-medium">₦13,000</span>
              </div>
              <div className="flex justify-between">
                <span>Hybrid</span>
                <span className="text-rose-gold font-medium">₦17,000</span>
              </div>
              <div className="flex justify-between">
                <span>Volume</span>
                <span className="text-rose-gold font-medium">₦22,000</span>
              </div>
              <div className="flex justify-between">
                <span>Mega Volume</span>
                <span className="text-rose-gold font-medium">₦25,000</span>
              </div>
            </div>
            
            {/* Extras */}
            <div className="mt-4">
              <div className="inline-block bg-rose-gold/20 px-3 py-0.5 rounded mb-2">
                <h3 className="font-body text-xs font-medium uppercase tracking-wider text-foreground">
                  Extras
                </h3>
              </div>
              <div className="space-y-1 font-body text-sm pl-1">
                <div className="flex justify-between">
                  <span>Wispy Effect</span>
                  <span className="text-rose-gold font-medium">₦5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Under Eyes</span>
                  <span className="text-rose-gold font-medium">₦5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Lash Removal</span>
                  <span className="text-rose-gold font-medium">₦5,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Refilling</span>
                  <span className="text-rose-gold font-medium text-xs">50% of initial set</span>
                </div>
              </div>
            </div>
          </section>

          {/* Middle Image Row */}
          <div className="flex justify-end gap-3 py-2">
            <img 
              src={browsImage} 
              alt="Brow artistry"
              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border-2 border-rose-gold shadow-soft"
            />
          </div>

          {/* Brows Section */}
          <section>
            <div className="inline-block bg-secondary/80 px-4 py-1 rounded mb-3">
              <h2 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground">
                Brows
              </h2>
            </div>
            <div className="space-y-1.5 font-body text-sm pl-1">
              <div className="flex justify-between">
                <span>Micro Blading</span>
                <span className="text-rose-gold font-medium">₦50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Ombré Brows</span>
                <span className="text-rose-gold font-medium">₦40,000</span>
              </div>
              <div className="flex justify-between">
                <span>Combination Brows</span>
                <span className="text-rose-gold font-medium">₦50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Micro Shading</span>
                <span className="text-rose-gold font-medium">₦60,000</span>
              </div>
            </div>
            
            {/* Brow Extras */}
            <div className="mt-3">
              <div className="inline-block bg-rose-gold/20 px-3 py-0.5 rounded mb-2">
                <h3 className="font-body text-xs font-medium uppercase tracking-wider text-foreground">
                  Extra
                </h3>
              </div>
              <div className="space-y-1 font-body text-sm pl-1">
                <div className="flex justify-between">
                  <span>Brow Lamination</span>
                  <span className="text-rose-gold font-medium">₦14,000</span>
                </div>
              </div>
            </div>
          </section>

          {/* Semi Permanent Tattoo Section */}
          <section>
            <div className="inline-block bg-secondary/80 px-4 py-1 rounded mb-3">
              <h2 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground">
                Semi-Permanent Tattoo
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5 font-body text-sm pl-1">
                <div className="flex justify-between">
                  <span>Small Design</span>
                  <span className="text-rose-gold font-medium">₦20,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Big Design</span>
                  <span className="text-rose-gold font-medium">₦30,000</span>
                </div>
              </div>
              {/* Tattoo Images */}
              <div className="flex gap-2">
                <img 
                  src={tattoo1Image} 
                  alt="Blessed tattoo"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-rose-gold shadow-soft"
                />
                <img 
                  src={tattoo2Image} 
                  alt="Butterfly tattoo"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-rose-gold shadow-soft"
                />
              </div>
            </div>
          </section>
        </main>

        {/* Decorative Divider */}
        <div className="ornament-line my-6" />

        {/* Contact Footer */}
        <footer className="text-center space-y-3">
          <h3 className="font-display text-lg font-semibold text-foreground">
            For Enquiries Contact Us:
          </h3>
          
          <div className="font-body text-sm space-y-1 text-foreground">
            <p>15 Ekoro Road, Abule Egba, Lagos</p>
            <p>📞 Phone: 09152581489</p>
            <p>💬 WhatsApp: 09152581489</p>
          </div>

          <div className="pt-2 space-y-1 font-body text-sm text-muted-foreground">
            <p>📸 Instagram: @Simi_aesthetic_123</p>
            <p>🎵 TikTok: @Simi_aesthetic_</p>
          </div>

          <p className="font-elegant text-base italic text-rose-gold pt-3">
            ✨ Where Beauty Meets Artistry ✨
          </p>
        </footer>

        {/* Decorative floral element */}
        <div className="flex justify-center mt-4 opacity-40">
          <svg width="80" height="40" viewBox="0 0 80 40" className="text-rose-gold">
            <path d="M10 35 Q20 20 40 20 Q60 20 70 35" stroke="currentColor" fill="none" strokeWidth="1"/>
            <circle cx="25" cy="28" r="3" fill="currentColor"/>
            <circle cx="40" cy="25" r="4" fill="currentColor"/>
            <circle cx="55" cy="28" r="3" fill="currentColor"/>
            <path d="M20 32 L25 28 M25 28 L30 32" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M35 30 L40 25 M40 25 L45 30" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M50 32 L55 28 M55 28 L60 32" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Index;
