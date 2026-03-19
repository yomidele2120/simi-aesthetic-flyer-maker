import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();

  const navigationItems = [
    { name: "Home", path: "/" },
    { name: "World", path: "/world" },
    { name: "Politics", path: "/politics" },
    { name: "Business", path: "/business" },
    { name: "Technology", path: "/technology" },
    { name: "Science", path: "/science" },
    { name: "Health", path: "/health" },
    { name: "Sports", path: "/sports" },
    { name: "Entertainment", path: "/entertainment" },
    { name: "Video", path: "/videos" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="container flex items-center justify-between py-2 text-xs text-muted-foreground">
        <span className="meta-text">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          {user ? (
            <button onClick={() => signOut()} className="hover:text-foreground transition-colors">Sign Out</button>
          ) : (
            <Link to="/login" className="hover:text-foreground transition-colors font-medium">Sign In</Link>
          )}
        </div>
      </div>

      {/* Masthead */}
      <div className="container flex flex-col gap-3 py-4 md:py-6 border-t border-border">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-foreground uppercase">
              Frontier
            </span>
          </Link>
          <button
            className="md:hidden p-2 hover:bg-muted rounded transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <p className="text-sm text-muted-foreground font-medium hidden md:block -mt-2">
          Independent journalism. Global perspective.
        </p>

        <div className="flex w-full items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-border rounded py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search Frontier..."
              aria-label="Search Frontier"
            />
          </div>
          {user ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email?.split("@")[0]}</span>
            </div>
          ) : (
            <Link to="/signup" className="hidden md:inline-flex items-center rounded border border-border px-3 py-2 text-xs font-semibold transition hover:bg-muted">
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block border-t border-border">
        <div className="container flex items-center gap-4 py-3 overflow-x-auto">
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link text-xs">
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container py-4 flex flex-col gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="nav-link text-sm py-2 border-b border-border"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/about" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>About</Link>
            <Link to="/contact" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>Contact</Link>
            {user ? (
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="nav-link text-sm py-2 border-b border-border text-left">
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/signup" className="nav-link text-sm py-2 border-b border-border" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
