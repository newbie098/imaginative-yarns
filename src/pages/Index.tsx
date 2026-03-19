import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import StoryHeader from "@/components/StoryHeader";
import WelcomeCard from "@/components/WelcomeCard";
import QuestionCard from "@/components/QuestionCard";
import StoryDisplay from "@/components/StoryDisplay";
import { storyQuestions, selectRandomOptions } from "@/data/storyQuestions";
import { streamStory } from "@/lib/storyApi";
import { getPastPicks, savePicks } from "@/lib/sessionMemory";
import { getCachedStory, saveCachedStory } from "@/lib/storyCache";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Phase = "welcome" | "questions" | "generating" | "story";

/**
 * Question order:
 * - Index 0: child_age (always first, never shuffled)
 * - Indices 1–2: hero_type, hero_name (anchor start)
 * - Indices 3–(n-3): middle questions (shuffled)
 * - Last 2: ending, length (anchor end)
 */
function buildSessionQuestions() {
  const anchor_first = storyQuestions.slice(0, 1); // child_age
  const anchor_start = storyQuestions.slice(1, 3); // hero_type, hero_name
  const anchor_end = storyQuestions.slice(-2);      // ending, length
  const middle = [...storyQuestions.slice(3, -2)];

  // Fisher-Yates shuffle middle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }

  const pastPicks = getPastPicks();

  const questions = [...anchor_first, ...anchor_start, ...middle, ...anchor_end].map((q) => {
    if (q.type === "choice" && q.options) {
      const displayCount = q.id === "length" ? q.options.length : 4;
      return {
        ...q,
        options: selectRandomOptions(q.options, displayCount, pastPicks[q.id] || []),
      };
    }
    // "select" and "text" types pass through as-is
    return q;
  });

  return questions;
}

const Index = () => {
  const { signOut, user } = useAuth();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [story, setStory] = useState("");
  const [fromCache, setFromCache] = useState(false);
  const [sessionQuestions] = useState(() => buildSessionQuestions());

  const pastPicks = useMemo(() => getPastPicks(), []);

  const handleStart = useCallback(() => setPhase("questions"), []);

  const handleAnswer = useCallback(
    (value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [sessionQuestions[currentQ].id]: value,
      }));
    },
    [currentQ, sessionQuestions]
  );

  const generateStory = useCallback((finalAnswers: Record<string, string>) => {
    savePicks(finalAnswers);
    setStory("");
    setFromCache(false);
    setPhase("generating");

    getCachedStory(finalAnswers).then((cached) => {
      if (cached) {
        setStory(cached);
        setFromCache(true);
        setPhase("story");
      } else {
        let fullStory = "";
        streamStory({
          answers: finalAnswers,
          onDelta: (chunk) => {
            fullStory += chunk;
            setStory((prev) => prev + chunk);
          },
          onDone: () => {
            setPhase("story");
            saveCachedStory(finalAnswers, fullStory);
          },
          onError: (msg) => {
            toast.error(msg);
            setPhase("questions");
          },
        });
      }
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentQ < sessionQuestions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      generateStory(answers);
    }
  }, [currentQ, answers, sessionQuestions, generateStory]);

  const handleSkip = useCallback(() => {
    const questionId = sessionQuestions[currentQ].id;
    const newAnswers = { ...answers };
    delete newAnswers[questionId];

    if (currentQ < sessionQuestions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ((q) => q + 1);
    } else {
      setAnswers(newAnswers);
      generateStory(newAnswers);
    }
  }, [currentQ, answers, sessionQuestions, generateStory]);

  const handleBack = useCallback(() => {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }, [currentQ]);

  const handleRestart = useCallback(() => {
    setPhase("welcome");
    setCurrentQ(0);
    setAnswers({});
    setStory("");
    setFromCache(false);
    window.location.reload();
  }, []);

  const currentQuestion = sessionQuestions[currentQ];
  const currentAnswer = answers[currentQuestion?.id] || "";
  const canProceed =
    currentQuestion?.type === "text"
      ? currentAnswer.trim().length > 0
      : currentAnswer.length > 0;

  return (
    <div className="min-h-screen bg-background px-4 pb-8">
      <div className="flex items-center justify-end gap-4 pt-4 pr-2">
        {user ? (
          <>
            <Link
              to="/saved-stories"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              My Stories
            </Link>
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Sign in
          </Link>
        )}
      </div>

      <StoryHeader
        questionsLeft={
          phase === "questions"
            ? sessionQuestions.length - currentQ
            : undefined
        }
      />

      <div className="mt-6">
        {phase === "welcome" && (
          <WelcomeCard onStart={handleStart} isLoggedIn={!!user} />
        )}

        {phase === "questions" && (
          <QuestionCard
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={currentQuestion?.optional ? handleSkip : undefined}
            isFirst={currentQ === 0}
            canProceed={canProceed}
            pastPicks={pastPicks[currentQuestion?.id] || []}
          />
        )}

        {(phase === "generating" || phase === "story") && (
          <StoryDisplay
            story={story}
            onRestart={handleRestart}
            isStreaming={phase === "generating"}
            fromCache={fromCache}
            isLoggedIn={!!user}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
