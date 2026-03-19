import { motion } from "framer-motion";
import { BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";

interface WelcomeCardProps {
  onStart: () => void;
  isLoggedIn: boolean;
}

const WelcomeCard = ({ onStart, isLoggedIn }: WelcomeCardProps) => {
  if (isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="story-card max-w-md w-full mx-auto text-center py-16 cursor-pointer"
        onClick={onStart}
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center">
            <BookOpenText className="w-10 h-10 text-olive-light" />
          </div>
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Ready to create<br />a story?
        </h2>
        <p className="category-label">Tap to begin</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="story-card max-w-md w-full mx-auto text-center py-12"
    >
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center">
          <BookOpenText className="w-10 h-10 text-olive-light" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">
        Ready to create<br />a story?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">
        Magical stories, crafted just for your child.
      </p>

      <div className="flex flex-col items-center gap-3">
        <Link
          to="/login"
          className="btn-primary w-full max-w-xs text-center"
        >
          Sign In / Sign Up
        </Link>
        <button
          onClick={onStart}
          className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors"
        >
          Continue without signing in
        </button>
        <p className="text-xs text-muted-foreground">Log in to save your story</p>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
