import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enQuestions from "./locales/en/questions.json";
import ptBRCommon from "./locales/pt-BR/common.json";
import ptBRQuestions from "./locales/pt-BR/questions.json";

const locale = import.meta.env.VITE_LOCALE || "pt-BR";

i18next.use(initReactI18next).init({
  lng: locale,
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "questions"],
  resources: {
    en: {
      common: enCommon,
      questions: enQuestions,
    },
    "pt-BR": {
      common: ptBRCommon,
      questions: ptBRQuestions,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
