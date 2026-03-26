

interface StoryHeaderProps {
  questionsLeft?: number;
}

const StoryHeader = ({ questionsLeft }: StoryHeaderProps) => {
  return (
    <div className="text-center pt-8 pb-4">
      <h1 className="text-4xl md:text-5xl font-display font-bold italic text-foreground">
        Make Me A Story   
      </h1>
      {questionsLeft !== undefined &&
      <p className="missions-label mt-1">
          {questionsLeft} {questionsLeft === 1 ? "question" : "questions"} left
        </p>
      }
    </div>);

};

export default StoryHeader;