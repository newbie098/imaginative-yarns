import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowLeft, Trash2, Loader2, BookMarked, Headphones, Play, Pause, Square, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSavedStories, deleteSavedStory, type SavedStory } from "@/lib/savedStories";
import StoryHeader from "@/components/StoryHeader";
import { generateStoryAudio } from "@/lib/storyAudio";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18next from "@/i18n";
import { useLocale } from "@/contexts/LocaleContext";

const SavedStories = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [openStory, setOpenStory] = useState<SavedStory | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "paused" | "error">("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslation();
  const { locale, localePath } = useLocale();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  useEffect(() => {
    if (!loading && !user) {
      navigate(localePath("/login"));
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      getSavedStories().then((data) => {
        setStories(data);
        setLoadingStories(false);
      });
    }
  }, [user]);

  const stopAndResetAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioState("idle");
    setAudioUrl(null);
  };

  const handleOpenStory = (story: SavedStory) => {
    stopAndResetAudio();
    setOpenStory(story);
    if (story.audio_url) {
      setAudioUrl(story.audio_url);
      setAudioState("paused");
    }
  };

  const handleCloseStory = () => {
    stopAndResetAudio();
    setOpenStory(null);
  };

  const playAudio = (url: string) => {
    if (!audioRef.current || audioRef.current.src !== url) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audio.onended = () => setAudioState("paused");
      audio.onerror = () => {
        toast.error(t("story.audioError"));
        setAudioState("error");
      };
      audioRef.current = audio;
    }
    audioRef.current.play();
    setAudioState("playing");
  };

  const handleListen = async () => {
    if (audioUrl) {
      playAudio(audioUrl);
      return;
    }
    if (!openStory) return;
    setAudioState("loading");
    try {
      const url = await generateStoryAudio(openStory.story_text, i18next.language);
      setAudioUrl(url);
      playAudio(url);
    } catch {
      toast.error(t("story.audioError"));
      setAudioState("error");
    }
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setAudioState("paused");
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioState("paused");
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const ok = await deleteSavedStory(id);
    if (ok) {
      setStories((prev) => prev.filter((s) => s.id !== id));
      if (openStory?.id === id) setOpenStory(null);
      toast.success(t("savedStories.deleted"));
    } else {
      toast.error(t("savedStories.deleteError"));
    }
    setDeleting(null);
  };

  const renderStoryText = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="font-display text-3xl font-bold text-foreground mb-4 mt-2">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="font-display text-xl font-bold text-foreground mb-2 mt-6">
            {line.slice(3)}
          </h2>
        );
      }
      if (line === "---") return <hr key={i} className="my-6 border-border" />;
      if (line.trim() === "") return <br key={i} />;

      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="text-foreground/90 leading-relaxed text-lg mb-2">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-foreground font-bold">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background px-4 pb-8">
      <div className="flex items-center justify-between pt-4 pr-2 pl-2">
        <Link
          to={localePath("/")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> {t("savedStories.backToStories")}
        </Link>
      </div>

      <StoryHeader />

      <div className="max-w-lg mx-auto mt-6">
        <div className="flex items-center gap-2 mb-6">
          <BookMarked className="w-5 h-5 text-golden" />
          <h2 className="font-display text-2xl font-bold text-foreground">{t("savedStories.title")}</h2>
        </div>

        {loadingStories ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-golden animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="story-card text-center py-16">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-foreground mb-2">{t("savedStories.noStoriesYet")}</p>
            <p className="text-muted-foreground text-sm mb-6">
              {t("savedStories.createFirst")}
            </p>
            <Link to={localePath("/")} className="btn-primary">
              {t("savedStories.createStory")}
            </Link>
          </div>
        ) : openStory ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={openStory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCloseStory}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold inline-flex items-center gap-1 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t("savedStories.allStories")}
              </button>
              <div className="story-card">
                {/* Audio player */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                  {audioState === "idle" || audioState === "error" ? (
                    <button
                      onClick={handleListen}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-golden hover:text-golden/80 transition-colors"
                    >
                      <Headphones className="w-4 h-4" />
                      {t("story.listen")}
                    </button>
                  ) : audioState === "loading" ? (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("story.audioLoading")}
                    </span>
                  ) : (
                    <>
                      {audioState === "playing" ? (
                        <button
                          onClick={handlePause}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-golden hover:text-golden/80 transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          {t("story.pauseAudio")}
                        </button>
                      ) : (
                        <button
                          onClick={() => playAudio(audioUrl!)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-golden hover:text-golden/80 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          {t("story.playAudio")}
                        </button>
                      )}
                      <button
                        onClick={handleStop}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Stop audio"
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={audioUrl!}
                        download
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {t("story.downloadAudio")}
                      </a>
                    </>
                  )}
                </div>
                {renderStoryText(openStory.story_text)}
              </div>
              <div className="flex items-center justify-between mt-4 px-1">
                <span className="text-xs text-muted-foreground">
                  {t("savedStories.savedDate", { date: formatDate(openStory.created_at) })}
                </span>
                <button
                  onClick={() => handleDelete(openStory.id)}
                  disabled={deleting === openStory.id}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1"
                >
                  {deleting === openStory.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  {t("savedStories.delete")}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col gap-3">
            {stories.map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="story-card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleOpenStory(story)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-foreground text-lg leading-snug truncate">
                      {story.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(story.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(story.id);
                    }}
                    disabled={deleting === story.id}
                    className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors p-1"
                    aria-label={t("savedStories.deleteAriaLabel")}
                  >
                    {deleting === story.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedStories;
