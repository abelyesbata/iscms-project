import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

// በሌሎች ኮምፖኔንቶች ላይ በቀላሉ ለመጠቀም
export const useLanguage = () => useContext(LanguageContext);