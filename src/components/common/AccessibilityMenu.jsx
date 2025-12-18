import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Type, RefreshCw, Link as LinkIcon, Waves } from "lucide-react";

const LS_KEY = "a11y_prefs_v1";

export default function AccessibilityMenu() {
  const [open, setOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [highContrast, setHighContrast] = React.useState(false);
  const [dyslexicFont, setDyslexicFont] = React.useState(false);
  const [underlineLinks, setUnderlineLinks] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const prefs = JSON.parse(raw);
        setZoom(prefs.zoom ?? 100);
        setHighContrast(!!prefs.highContrast);
        setDyslexicFont(!!prefs.dyslexicFont);
        setUnderlineLinks(!!prefs.underlineLinks);
        setReduceMotion(!!prefs.reduceMotion);
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    const html = document.documentElement;

    html.style.setProperty("--a11y-font-size", `${zoom}%`);

    const toggle = (cond, cls) => {
      html.classList.toggle(cls, !!cond);
    };

    toggle(highContrast, "a11y-high-contrast");
    toggle(dyslexicFont, "a11y-dyslexia");
    toggle(underlineLinks, "a11y-underline-links");
    toggle(reduceMotion, "a11y-reduce-motion");

    const prefs = { zoom, highContrast, dyslexicFont, underlineLinks, reduceMotion };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    } catch {}
  }, [zoom, highContrast, dyslexicFont, underlineLinks, reduceMotion]);

  const resetAll = () => {
    setZoom(100);
    setHighContrast(false);
    setDyslexicFont(false);
    setUnderlineLinks(false);
    setReduceMotion(false);
  };

  return (
    <>
      <style>{`
        html { font-size: var(--a11y-font-size, 100%); }

        @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap');
        html.a11y-dyslexia, html.a11y-dyslexia body, html.a11y-dyslexia * {
          font-family: "Atkinson Hyperlegible", "Noto Sans Hebrew", Arial, sans-serif !important;
          letter-spacing: 0.02em !important;
          line-height: 1.6 !important;
        }

        html.a11y-high-contrast, html.a11y-high-contrast body {
          background: #000 !important;
          color: #fff !important;
        }
        html.a11y-high-contrast * {
          color: #fff !important;
          border-color: rgba(255,255,255,0.6) !important;
        }
        html.a11y-high-contrast a {
          color: #ffeb3b !important;
        }
        html.a11y-high-contrast .bg-white,
        html.a11y-high-contrast [class*="bg-neutral"],
        html.a11y-high-contrast [class*="bg-slate"],
        html.a11y-high-contrast [class*="bg-gray"],
        html.a11y-high-contrast .card,
        html.a11y-high-contrast .popover,
        html.a11y-high-contrast .dropdown {
          background-color: #0a0a0a !important;
        }

        html.a11y-underline-links a, 
        html.a11y-underline-links a:visited {
          text-decoration: underline !important;
          text-underline-offset: 2px !important;
        }

        html.a11y-reduce-motion *, 
        html.a11y-reduce-motion *::before, 
        html.a11y-reduce-motion *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
        }

        .a11y-fab { position: fixed; z-index: 9999; }
        .a11y-panel { position: fixed; z-index: 9999; }

        /* Clean accessibility button style */
        .accessibility-btn {
          background: rgba(23, 23, 23, 0.9);
          border: 1px solid rgba(64, 64, 64, 0.5);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .accessibility-btn:hover {
          background: rgba(40, 40, 40, 0.9);
          border-color: rgba(100, 100, 100, 0.7);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }
      `}</style>

      <div className="a11y-fab bottom-4 left-4">
        <button
          aria-label="פתח תפריט נגישות"
          className="accessibility-btn flex items-center gap-2 hebrew-font"
          onClick={() => setOpen(!open)}
        >
          <Eye className="w-4 h-4" />
          נגישות
        </button>
      </div>

      {open && (
        <div
          className="a11y-panel bottom-20 left-4 w-[92vw] max-w-sm"
          role="dialog"
          aria-modal="true"
          aria-label="תפריט נגישות"
        >
          <Card className="bg-neutral-900/95 backdrop-blur-md border border-neutral-700 shadow-2xl rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-neutral-100 hebrew-font text-base">
                התאמות נגישות לתצוגה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-200">
                    <Type className="w-4 h-4" />
                    <span className="hebrew-font text-sm">גודל טקסט</span>
                  </div>
                  <span className="text-xs text-neutral-400 tabular-nums">{zoom}%</span>
                </div>
                <Slider
                  value={[zoom]}
                  min={80}
                  max={200}
                  step={5}
                  onValueChange={([v]) => setZoom(v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-200">
                  <Eye className="w-4 h-4" />
                  <span className="hebrew-font text-sm">ניגודיות גבוהה</span>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-200">
                  <Type className="w-4 h-4" />
                  <span className="hebrew-font text-sm">גופן ידידותי לדיסלקציה</span>
                </div>
                <Switch checked={dyslexicFont} onCheckedChange={setDyslexicFont} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-200">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hebrew-font text-sm">הדגשת קישורים (קו תחתון)</span>
                </div>
                <Switch checked={underlineLinks} onCheckedChange={setUnderlineLinks} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-200">
                  <Waves className="w-4 h-4" />
                  <span className="hebrew-font text-sm">הפחתת תנועה/אנימציות</span>
                </div>
                <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
              </div>

              <div className="pt-1">
                <Button
                  variant="outline"
                  className="w-full border-neutral-600 text-neutral-200 hover:bg-neutral-800 hebrew-font"
                  onClick={resetAll}
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  אפס הגדרות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}