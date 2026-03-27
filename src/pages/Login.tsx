import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/contexts/LocaleContext";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { localePath } = useLocale();

  // Redirect to home if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(localePath("/"));
    }
  }, [user, loading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t("login.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(localePath("/"));
      }
    } catch (err: any) {
      toast.error(err.message || t("login.authFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="story-card max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-display font-bold italic text-foreground">
            {t("app.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("login.subtitle")}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("login.email")}
              required
              className="w-full rounded-xl border-2 border-border pl-11 pr-5 py-3.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.password")}
              required
              minLength={6}
              className="w-full rounded-xl border-2 border-border pl-11 pr-5 py-3.5 text-sm font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? t("login.pleaseWait") : isSignUp ? t("login.signUp") : t("login.signIn")}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? t("login.alreadyHaveAccount") : t("login.dontHaveAccount")}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-foreground hover:underline"
          >
            {isSignUp ? t("login.signIn") : t("login.signUp")}
          </button>
        </p>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <Link
            to={localePath("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("login.continueWithout")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
