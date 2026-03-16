import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, RotateCcw, Loader2, Download, Zap } from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface StoryDisplayProps {
  story: string;
  onRestart: () => void;
  isStreaming?: boolean;
  fromCache?: boolean;
}

const StoryDisplay = ({ story, onRestart, isStreaming, fromCache }: StoryDisplayProps) => {
  const [saving, setSaving] = useState(false);

  const handleSavePdf = async () => {
    setSaving(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      const ensureSpace = (needed: number) => {
        if (y + needed > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      // Render story text
      const lines = story.split("\n");
      for (const line of lines) {
        if (line.startsWith("# ")) {
          ensureSpace(14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(22);
          const wrapped = doc.splitTextToSize(line.slice(2), contentW);
          doc.text(wrapped, pageW / 2, y, { align: "center" });
          y += wrapped.length * 9 + 4;
        } else if (line.startsWith("## ")) {
          ensureSpace(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          const wrapped = doc.splitTextToSize(line.slice(3), contentW);
          doc.text(wrapped, margin, y);
          y += wrapped.length * 6 + 4;
        } else if (line === "---") {
          ensureSpace(8);
          y += 3;
          doc.setDrawColor(200);
          doc.line(margin, y, pageW - margin, y);
          y += 5;
        } else if (line.trim() === "") {
          y += 4;
        } else {
          // Handle bold markers by stripping them for PDF
          const clean = line.replace(/\*\*(.*?)\*\*/g, "$1");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          const wrapped = doc.splitTextToSize(clean, contentW);
          ensureSpace(wrapped.length * 5);
          doc.text(wrapped, margin, y);
          y += wrapped.length * 5 + 2;
        }
      }

      // Extract title for filename
      const titleMatch = story.match(/^# (.+)/m);
      const filename = titleMatch
        ? titleMatch[1].replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-").toLowerCase()
        : "story";

      doc.save(`${filename}.pdf`);
      toast.success("Story saved as PDF!");
    } catch (e) {
      console.error("PDF error:", e);
      toast.error("Failed to save PDF. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const renderStory = (text: string) => {
    return text.split("\n").map((line, i) => {
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
      if (line === "---") {
        return <hr key={i} className="my-6 border-border" />;
      }
      if (line.trim() === "") return <br key={i} />;

      // Bold text
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-lg w-full mx-auto"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-golden" />
        <span className="category-label">
          {isStreaming ? "Writing your story…" : "Your Story"}
        </span>
        {isStreaming && (
          <Loader2 className="w-4 h-4 text-golden animate-spin" />
        )}
        {!isStreaming && fromCache && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <Zap className="w-3 h-3" /> From cache
          </span>
        )}
      </div>

      <div className="story-card">
        {story ? renderStory(story) : (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-golden animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Crafting something magical…</p>
          </div>
        )}
      </div>

      {!isStreaming && (
        <div className="flex flex-col items-center gap-3 mt-8 pb-12">
          <button onClick={handleSavePdf} disabled={saving} className="btn-primary inline-flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {saving ? "Saving…" : "Save as PDF"}
          </button>
          <button onClick={onRestart} className="text-muted-foreground text-sm font-semibold hover:text-foreground transition-colors inline-flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5" />
            Create Another Story
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default StoryDisplay;
