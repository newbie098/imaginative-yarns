import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-feedback", {
        body: { name: name.trim(), email: email.trim(), feedback: feedback.trim() },
      });

      if (error) throw error;

      toast({ title: "Thank you!", description: "Your feedback has been sent." });
      setName("");
      setEmail("");
      setFeedback("");
      setOpen(false);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[hsl(var(--olive))] px-4 py-3 text-[hsl(var(--cream))] shadow-lg transition-transform hover:scale-105 hover:shadow-xl font-nunito font-semibold text-sm"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md font-nunito">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-[hsl(var(--bark))]">
              Share your feedback
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--muted-foreground))]">
              We'd love to hear what you think!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-name" className="text-[hsl(var(--bark))]">
                Name <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
              </Label>
              <Input
                id="fb-name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-email" className="text-[hsl(var(--bark))]">
                Email <span className="text-[hsl(var(--muted-foreground))] font-normal">(optional)</span>
              </Label>
              <Input
                id="fb-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fb-text" className="text-[hsl(var(--bark))]">
                Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="fb-text"
                placeholder="Tell us what you think…"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                disabled={submitting}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!feedback.trim() || submitting}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Sending…" : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
