import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

interface AuthPromptDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const AuthPromptDialog = ({ open, onClose, message }: AuthPromptDialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-lg shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold">Join Frontier</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {message || "Sign in to like stories, post comments, and get a personalised experience."}
        </p>
        <div className="space-y-3">
          <Link
            to="/signup"
            onClick={onClose}
            className="block w-full text-center bg-foreground text-background px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors rounded"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            onClick={onClose}
            className="block w-full text-center border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors rounded"
          >
            Sign In
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Free to join. No spam. Ever.
        </p>
      </div>
    </div>
  );
};

/** Hook: shows welcome popup once per session for unauthenticated users */
export const useWelcomePrompt = () => {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) return;
    const seen = sessionStorage.getItem("frontier_welcome_shown");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        sessionStorage.setItem("frontier_welcome_shown", "1");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return { showWelcome, setShowWelcome };
};

export default AuthPromptDialog;
