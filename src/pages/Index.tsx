import lashesImage from "@/assets/lashes-1.jpg";
import browsImage from "@/assets/brows-1.jpg";
import tattoo1Image from "@/assets/tattoo-1.jpg";
import tattoo2Image from "@/assets/tattoo-2.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-pink-soft p-3 md:p-6">
      {/* Main Flyer Container with Decorative Border */}
      <div className="max-w-lg mx-auto bg-gradient-pink-shine decorative-border-double corner-decoration rounded-sm shadow-2xl overflow-hidden">
        
        {/* Inner Content */}
        <div className="p-6 md:p-8 relative">
          
          {/* Floating sparkle decorations */}
          <div className="absolute top-4 right-16 text-primary text-lg sparkle">✦</div>
          <div className="absolute top-20 left-4 text-primary text-sm sparkle" style={{ animationDelay: '0.5s' }}>✦</div>
          <div className="absolute bottom-40 right-6 text-primary text-base sparkle" style={{ animationDelay: '1.5s' }}>✦</div>

          {/* Header */}
          <header className="text-center mb-6 relative">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-wide">
              <span className="shimmer-gold">Simi</span>{" "}
              <span className="text-pink-deep italic">Aesthetic</span>
            </h1>
            <div className="mt-3 flex justify-center">
              <div className="ornament-line w-32" />
            </div>
            <p className="font-elegant text-lg md:text-xl italic text-muted-foreground mt-4 leading-relaxed px-4">
              Welcome to Simi Aesthetic, where beauty meets art!<br/>
              <span className="text-pink-deep font-medium">Treat yourself to a luxurious experience.</span>
            </p>
          </header>

          {/* Lash Image - Top Right */}
          <div className="absolute top-6 right-6 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 scale-110" />
              <img 
                src={lashesImage} 
                alt="Lash extensions"
                className="relative w-20 h-20 md:w-24 md:h-24 object-cover rounded-full border-3 border-pink-deep glow-pink-soft"
              />
            </div>
          </div>

          {/* Services Content */}
          <main className="space-y-5 mt-2">
            
            {/* Lash Extension Section */}
            <section>
              <div className="section-label mb-3">
                Lash Extension
              </div>
              <div className="space-y-2 font-body text-sm md:text-base pl-1">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Classic Set</span>
                  <span className="text-pink-deep font-bold">₦13,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Hybrid</span>
                  <span className="text-pink-deep font-bold">₦17,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Volume</span>
                  <span className="text-pink-deep font-bold">₦22,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Mega Volume</span>
                  <span className="text-pink-deep font-bold">₦25,000</span>
                </div>
              </div>
              
              {/* Extras */}
              <div className="mt-4">
                <div className="section-label section-label-light mb-2">
                  Extras
                </div>
                <div className="space-y-1.5 font-body text-sm pl-1">
                  <div className="flex justify-between">
                    <span className="text-foreground">Wispy Effect</span>
                    <span className="text-pink-deep font-semibold">₦5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Under Eyes</span>
                    <span className="text-pink-deep font-semibold">₦5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Lash Removal</span>
                    <span className="text-pink-deep font-semibold">₦5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground">Refilling</span>
                    <span className="text-pink-deep font-semibold text-xs">50% of initial set</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Decorative Divider with Brow Image */}
            <div className="flex items-center gap-4 py-2">
              <div className="ornament-line flex-1" />
              <img 
                src={browsImage} 
                alt="Brow artistry"
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-3 border-pink-deep glow-pink-soft"
              />
              <div className="ornament-line flex-1" />
            </div>

            {/* Brows Section */}
            <section>
              <div className="section-label mb-3">
                Brows
              </div>
              <div className="space-y-2 font-body text-sm md:text-base pl-1">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Micro Blading</span>
                  <span className="text-pink-deep font-bold">₦50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Ombré Brows</span>
                  <span className="text-pink-deep font-bold">₦40,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Combination Brows</span>
                  <span className="text-pink-deep font-bold">₦50,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Micro Shading</span>
                  <span className="text-pink-deep font-bold">₦60,000</span>
                </div>
              </div>
              
              {/* Brow Extras */}
              <div className="mt-3">
                <div className="section-label section-label-light mb-2">
                  Extra
                </div>
                <div className="font-body text-sm pl-1">
                  <div className="flex justify-between">
                    <span className="text-foreground">Brow Lamination</span>
                    <span className="text-pink-deep font-semibold">₦14,000</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Fancy Divider */}
            <div className="ornament-line-fancy my-4" />

            {/* Semi Permanent Tattoo Section */}
            <section>
              <div className="section-label mb-3">
                Semi-Permanent Tattoo
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-2 font-body text-sm md:text-base pl-1">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">Small Design</span>
                    <span className="text-pink-deep font-bold">₦20,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">Big Design</span>
                    <span className="text-pink-deep font-bold">₦30,000</span>
                  </div>
                </div>
                {/* Tattoo Images */}
                <div className="flex gap-2">
                  <img 
                    src={tattoo1Image} 
                    alt="Blessed tattoo"
                    className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg border-2 border-pink-deep glow-pink-soft"
                  />
                  <img 
                    src={tattoo2Image} 
                    alt="Butterfly tattoo"
                    className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg border-2 border-pink-deep glow-pink-soft"
                  />
                </div>
              </div>
            </section>
          </main>

          {/* Decorative Divider */}
          <div className="ornament-line my-6" />

          {/* Contact Footer */}
          <footer className="text-center space-y-3 bg-pink-light/50 -mx-6 md:-mx-8 px-6 py-5 mt-6 border-t-2 border-pink-medium">
            <h3 className="font-display text-lg font-bold text-pink-deep">
              ✨ For Enquiries Contact Us ✨
            </h3>
            
            <div className="font-body text-sm md:text-base space-y-1.5 text-foreground font-medium">
              <p>📍 15 Ekoro Road, Abule Egba, Lagos</p>
              <p>📞 Phone: 09152581489</p>
              <p>💬 WhatsApp: 09152581489</p>
            </div>

            <div className="pt-2 space-y-1 font-body text-sm text-muted-foreground">
              <p>📸 Instagram: @Simi_aesthetic_123</p>
              <p>🎵 TikTok: @Simi_aesthetic_</p>
            </div>

            <p className="font-elegant text-xl italic text-pink-deep pt-3 font-semibold">
              ❀ Where Beauty Meets Artistry ❀
            </p>
          </footer>

          {/* Bottom decorative flowers */}
          <div className="flex justify-center gap-1 mt-4 text-primary opacity-60">
            <span className="text-lg">❀</span>
            <span className="text-sm mt-1">✦</span>
            <span className="text-xl">❀</span>
            <span className="text-sm mt-1">✦</span>
            <span className="text-lg">❀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
