const NewsletterSignup = () => (
  <section className="bg-foreground text-background py-12 md:py-16">
    <div className="container text-center max-w-2xl">
      <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Stay Informed</h2>
      <p className="text-background/60 mb-6">
        Get Frontier's most important stories delivered to your inbox every morning. No spam, just journalism.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Your email address"
          className="flex-1 bg-background/10 border border-background/20 px-4 py-3 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-primary"
        />
        <button className="bg-primary text-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  </section>
);

export default NewsletterSignup;
