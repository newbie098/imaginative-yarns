import { motion } from "framer-motion";
import { BookOpenText } from "lucide-react";

interface WelcomeCardProps {
  onStart: () => void;
}

const WelcomeCard = ({ onStart }: WelcomeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="story-card max-w-md w-full mx-auto text-center py-16 cursor-pointer"
      onClick={onStart}>
      
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center">
          <BookOpenText className="w-10 h-10 text-olive-light" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-3">
        Ready to create<br />a story?
      </h2>
      <p className="category-label">Tap to begin</p>
    </motion.div>);

};

export default WelcomeCard;