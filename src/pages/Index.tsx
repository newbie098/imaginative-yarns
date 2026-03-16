import { useState, useCallback, useMemo } from "react";
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

/** Shuffle middle questions (indices 2–7), keep hero (0–1) and ending/length (last 2) fixed */
function buildSessionQuestions() {
  const anchor_start = storyQuestions.slice(0, 2); // hero_type, hero_name
  const anchor_end = storyQuestions.slice(-2);       // ending, length
  const middle = [...storyQuestions.slice(2, -2)];

  // Fisher-Yates shuffle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }

  const pastPicks = getPastPicks();

  // Pre-select random options for each question
  const questions = [...anchor_start, ...middle, ...anchor_end].map((q) => {
    if (q.type === "choice" && q.options) {
      const displayCount = q.id === "length" ? q.options.length : 4;
      return {
        ...q,
        options: selectRandomOptions(q.options, displayCount, pastPicks[q.id] || []),
      };
    }
    return q;
  });

  return questions;
}

const Index = () => {
  const { signOut } = useAuth();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [story, setStory] = useState("");
  const [fromCache, setFromCache] = useState(false);
  // Build shuffled questions with random option subsets once per session
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
    // Force page reload to get fresh shuffled questions & options
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
      <div className="flex justify-end pt-4 pr-2">
        <button
          onClick={signOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Sign out
        </button>
      </div>
      <StoryHeader
        questionsLeft={
          phase === "questions"
            ? sessionQuestions.length - currentQ
            : undefined
        }
      />

      <div className="mt-6">
        {phase === "welcome" && <WelcomeCard onStart={handleStart} />}

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
          />
        )}
      </div>
    </div>
  );
};

export default Index;
