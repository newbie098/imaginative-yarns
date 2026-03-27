import { useNavigate, useLocation } from "react-router-dom";
import { useLocale } from "@/contexts/LocaleContext";

const LANGUAGES = [
  { code: "en", label: "EN", prefix: "" },
  { code: "pt-BR", label: "PT", prefix: "/pt-br" },
];

const LanguageSwitcher = () => {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const switchTo = (target: typeof LANGUAGES[number]) => {
    if (target.code === locale) return;
    const currentPrefix = LANGUAGES.find((l) => l.code === locale)?.prefix ?? "";
    const basePath = currentPrefix
      ? location.pathname.replace(new RegExp(`^${currentPrefix}`), "") || "/"
      : location.pathname;
    const newPath = target.prefix
      ? target.prefix + (basePath === "/" ? "/" : basePath)
      : basePath;
    navigate(newPath);
  };

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {LANGUAGES.map((lang, i) => (
        <span key={lang.code} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground/40">|</span>}
          <button
            onClick={() => switchTo(lang)}
            className={
              locale === lang.code
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {lang.label}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
