import { useTranslation } from "react-i18next";

interface StoryHeaderProps {
  questionsLeft?: number;
}

const StoryHeader = ({ questionsLeft }: StoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center pt-8 pb-4">
      <h1 className="text-4xl md:text-5xl font-display font-bold italic text-foreground">
        {t("app.title")}
      </h1>
      {questionsLeft !== undefined &&
      <p className="missions-label mt-1">
          {t("question.questionsLeft", { count: questionsLeft })}
        </p>
      }
    </div>);

};

export default StoryHeader;
