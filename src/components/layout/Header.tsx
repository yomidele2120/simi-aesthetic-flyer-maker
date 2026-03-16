import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { categories } from "@/lib/mockData";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-border">
      {/* Top bar */}
      <div className="container flex items-center justify-between py-2 text-xs text-muted-foreground">
        <span className="meta-text">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link to="/admin" className="hover:text-foreground transition-colors font-medium">Admin</Link>
        </div>
      </div>

      {/* Masthead */}
      <div className="container flex items-center justify-between py-6 md:py-8 border-t border-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Core<span className="text-primary">News</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-muted rounded transition-colors" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button
            className="md:hidden p-2 hover:bg-muted rounded transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block border-t border-border">
        <div className="container flex items-center gap-6 py-3">
          {categories.map((cat) => (
            <Link key={cat.path} to={cat.path} className="nav-link text-xs">
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className="nav-link text-sm py-2 border-b border-border"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/about" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>Contact</Link>
            <Link to="/admin" className="nav-link text-sm py-2 font-semibold" onClick={() => setMobileOpen(false)}>Admin</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
