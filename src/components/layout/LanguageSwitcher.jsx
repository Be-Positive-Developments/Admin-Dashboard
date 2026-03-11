import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "ع" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const dir = i18n.dir(i18n.language);
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle language">
          {/* Shows "EN" or "ع" depending on active language */}
          <span
            className={`font-bold text-sm leading-none ${isArabic ? "font-arabic" : ""}`}
          >
            {isArabic ? "ع" : "EN"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => {
          const isActive = i18n.language.startsWith(lang.code);
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2">
                <span className="w-6 text-center font-bold text-xs text-muted-foreground">
                  {lang.short}
                </span>
                {lang.label}
              </span>
              {isActive && <Check className="h-4 w-4 text-red-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
