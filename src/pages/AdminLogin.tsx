import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-serif text-2xl font-bold">
            Core<span className="text-primary">News</span>
          </Link>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">
            Admin Login
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-background border border-border p-6 space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 border border-destructive/20">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors bg-background"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background px-6 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
