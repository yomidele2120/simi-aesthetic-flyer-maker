import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-foreground text-background">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <span className="font-serif text-2xl font-bold uppercase tracking-tight">
            Frontier
          </span>
          <p className="mt-3 text-sm text-background/60 leading-relaxed">
            Independent journalism. Global perspective. Accurate, balanced, and timely information for informed citizens.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-background/40">Sections</h4>
          <div className="flex flex-col gap-2">
            {["Nigeria", "World", "Business & Economy", "Technology", "Investigations", "Opinions"].map((s) => (
              <Link key={s} to={`/${s.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`} className="text-sm text-background/60 hover:text-background transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-background/40">Company</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-sm text-background/60 hover:text-background transition-colors">About Frontier</Link>
            <Link to="/contact" className="text-sm text-background/60 hover:text-background transition-colors">Contact Us</Link>
            <Link to="/contact" className="text-sm text-background/60 hover:text-background transition-colors">Submit a Story</Link>
            <Link to="/contact" className="text-sm text-background/60 hover:text-background transition-colors">Advertise</Link>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-background/40">Stay Connected</h4>
          <p className="text-sm text-background/60 mb-4">Get the latest stories delivered to your inbox.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-background/10 border border-background/20 px-3 py-2 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-primary"
            />
            <button className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              Subscribe
            </button>
          </div>
          <div className="flex gap-4 mt-4 text-background/40">
            <span className="text-sm hover:text-background cursor-pointer transition-colors">Twitter/X</span>
            <span className="text-sm hover:text-background cursor-pointer transition-colors">Facebook</span>
            <span className="text-sm hover:text-background cursor-pointer transition-colors">YouTube</span>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-background/40">© {new Date().getFullYear()} Frontier. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="text-xs text-background/40">Privacy Policy</span>
          <Link to="/admin/login" className="text-xs text-background/40 hover:text-background/40 transition-colors cursor-default">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
