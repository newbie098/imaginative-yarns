import { motion, AnimatePresence } from "framer-motion";
import type { StoryQuestion } from "@/data/storyQuestions";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface QuestionCardProps {
  question: StoryQuestion;
  answer: string;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  isFirst: boolean;
  canProceed: boolean;
  pastPicks?: string[];
}

const QuestionCard = ({
  question,
  answer,
  onAnswer,
  onNext,
  onBack,
  onSkip,
  isFirst,
  canProceed,
  pastPicks = [],
}: QuestionCardProps) => {
  const [direction, setDirection] = useState(1);
  const { t } = useTranslation(["common", "questions"]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: direction * 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -direction * 60 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="story-card max-w-md w-full mx-auto"
      >
        <div className="flex items-center gap-2">
          <span className="category-label">{t(question.category, { ns: "questions" })}</span>
          {question.optional && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {t("question.optional")}
            </span>
          )}
        </div>
        <h2 className="font-display text-2xl font-bold mt-2 mb-1 text-foreground">
          {t(question.title, { ns: "questions" })}
        </h2>
        <p className="text-muted-foreground text-sm mb-5">{t(question.prompt, { ns: "questions" })}</p>

        {question.type === "choice" && question.options && (
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                className={`option-button flex items-center gap-3 relative ${
                  answer === opt.id ? "selected" : ""
                }`}
                onClick={() => onAnswer(opt.id)}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="font-semibold text-foreground">{t(opt.label, { ns: "questions" })}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === "select" && question.options && (
          <div className="relative">
            <select
              value={answer}
              onChange={(e) => onAnswer(e.target.value)}
              className="w-full rounded-xl border-2 border-border px-5 py-4 text-lg font-body bg-background text-foreground focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="">{t("question.chooseAge")}</option>
              {question.options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.emoji} {t(opt.label, { ns: "questions" })}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        )}

        {question.type === "text" && (
          <input
            type="text"
            value={answer}
            onChange={(e) => onAnswer(e.target.value)}
            placeholder={question.placeholder ? t(question.placeholder, { ns: "questions" }) : undefined}
            className="w-full rounded-xl border-2 border-border px-5 py-4 text-lg font-body bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canProceed) onNext();
            }}
          />
        )}

        <div className="flex justify-between mt-6">
          {!isFirst ? (
            <button
              onClick={() => {
                setDirection(-1);
                onBack();
              }}
              className="text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
            >
              {t("question.back")}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {onSkip && (
              <button
                onClick={() => {
                  setDirection(1);
                  onSkip();
                }}
                className="text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors"
              >
                {t("question.skip")}
              </button>
            )}
            {canProceed && (
              <button
                onClick={() => {
                  setDirection(1);
                  onNext();
                }}
                className="btn-primary"
              >
                {t("question.next")}
              </button>
            )}
            {!canProceed && !onSkip && (
              <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                {t("question.pickOne")}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionCard;
