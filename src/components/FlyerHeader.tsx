const FlyerHeader = () => {
  return (
    <header className="relative py-12 px-6 text-center bg-gradient-elegant overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-rose-gold-light/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-rose-gold-light/10 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Brand Name */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-wide mb-2">
          Simi <span className="text-rose-gold">Aesthetic</span>
        </h1>
        
        {/* Tagline */}
        <p className="font-elegant text-xl md:text-2xl italic text-muted-foreground mt-4">
          Enhancing Your Natural Beauty
        </p>
        
        {/* Decorative line */}
        <div className="ornament-line w-48 mx-auto mt-6" />
        
        {/* Services summary */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <span className="px-4 py-1.5 bg-blush rounded-full font-body text-sm text-foreground">
            Lash Extensions
          </span>
          <span className="px-4 py-1.5 bg-blush rounded-full font-body text-sm text-foreground">
            Brow Artistry
          </span>
          <span className="px-4 py-1.5 bg-blush rounded-full font-body text-sm text-foreground">
            Semi-Permanent Tattoo
          </span>
        </div>
      </div>
    </header>
  );
};

export default FlyerHeader;
