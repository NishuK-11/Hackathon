import { useSelector } from 'react-redux';
import { translations } from '../i18n';

export const useTranslation = () => {
  const language = useSelector((state) => state.ui?.language || 'en');
  const t = translations[language] || translations.en;
  return { t, language };
};

export default useTranslation;
