import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // New import for Label component
import { Move, AlignLeft, AlignCenter, AlignRight, X, Trash2, Plus, Minus, Palette } from "lucide-react";

export default function InlineTextToolbar({
  selectedText, // Renamed from 'element'
  position,            // {left, top, width, height} - screen coords from Canvas
  onUpdate,            // Renamed from 'onChange' - (id, updates) => void
  onDelete,            // (id) => void
  onClose,             // () => void
  isMobile = false,
  fonts = []           // New prop, not used in the provided outline but included
}) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // Local state mirrors (kept tiny to avoid lag)
  const [text, setText] = useState(selectedText?.content || "");
  const [fontSize, setFontSize] = useState(selectedText?.fontSize || 120);
  const [align, setAlign] = useState(selectedText?.textAlign || "center");
  const [color, setColor] = useState(selectedText?.color || "#ffffff");
  const [strokeColor, setStrokeColor] = useState(selectedText?.stroke?.color || "#000000");
  const [strokeWidth, setStrokeWidth] = useState(selectedText?.stroke?.width || 8);
  const [gradEnabled, setGradEnabled] = useState(!!selectedText?.gradient?.enabled);
  const [gradDir, setGradDir] = useState(selectedText?.gradient?.direction || "vertical");
  const [gradColors, setGradColors] = useState(
    selectedText?.gradient?.colors && selectedText.gradient.colors.length >= 2
      ? selectedText.gradient.colors.slice(0, 3)
      : ["#F7D14C", "#FFFFFF", "#FF7A1A"]
  );

  // Mobile placement: auto above selection; fallback below; allow drag to pin custom pos
  const [pinned, setPinned] = useState(false);
  const [customPos, setCustomPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, dx: 0, dy: 0 });
  const boxRef = useRef(null);

  useEffect(() => {
    if (!selectedText) return;
    // Update local state when selectedText (formerly element) changes
    setText(selectedText.content || "");
    setFontSize(selectedText.fontSize || 120);
    setAlign(selectedText.textAlign || "center");
    setColor(selectedText.color || "#ffffff");
    setStrokeColor(selectedText.stroke?.color || "#000000");
    setStrokeWidth(selectedText.stroke?.width || 8);
    setGradEnabled(!!selectedText.gradient?.enabled);
    setGradDir(selectedText.gradient?.direction || "vertical");
    setGradColors(
      selectedText.gradient?.colors && selectedText.gradient.colors.length >= 2
        ? selectedText.gradient.colors.slice(0, 3)
        : ["#F7D14C", "#FFFFFF", "#FF7A1A"]
    );
  }, [selectedText?.id]);

  // Push changes upstream gently
  const commit = (updates) => {
    onUpdate?.(selectedText.id, updates); // Using onUpdate instead of onChange
  };

  // Handlers
  const nudgeFont = (delta) => {
    const next = Math.max(8, Math.round((fontSize + delta) * 10) / 10);
    setFontSize(next);
    commit({ fontSize: next });
  };

  const applyText = (val) => {
    setText(val);
    commit({ content: val });
  };

  const applyAlign = (val) => {
    setAlign(val);
    commit({ textAlign: val });
  };

  const applyColor = (val) => {
    setColor(val);
    if (!gradEnabled) commit({ color: val });
  };

  const applyStrokeColor = (val) => {
    setStrokeColor(val);
    commit({ stroke: { ...(selectedText.stroke || {}), color: val, enabled: true, width: strokeWidth } });
  };

  const applyStrokeWidth = (val) => {
    const v = Math.max(0, Number(val) || 0);
    setStrokeWidth(v);
    commit({ stroke: { ...(selectedText.stroke || {}), color: strokeColor, enabled: v > 0, width: v } });
  };

  const applyGradEnabled = (checked) => {
    setGradEnabled(checked);
    if (checked) {
      commit({
        gradient: { enabled: true, direction: gradDir, colors: gradColors },
        // when gradient is on, the base color is less relevant; keep for glow/fallback
        color: color
      });
    } else {
      commit({ gradient: { enabled: false }, color });
    }
  };

  const applyGradDir = (dir) => {
    setGradDir(dir);
    if (gradEnabled) commit({ gradient: { enabled: true, direction: dir, colors: gradColors } });
  };

  const applyGradColor = (idx, val) => {
    const next = [...gradColors];
    next[idx] = val;
    setGradColors(next);
    if (gradEnabled) commit({ gradient: { enabled: true, direction: gradDir, colors: next } });
  };

  // NEW: FLUX.1 Kontext Pro text effects presets
  const textEffectPresets = {
    impact: {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontWeight: 900,
      textShadow: '3px 3px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000',
      color: '#FFFF00',
      WebkitTextStroke: '2px #000000'
    },
    neon: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
      color: '#00ff00',
      WebkitTextStroke: '1px #ffffff'
    },
    metallic: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      background: 'linear-gradient(45deg, #c0c0c0, #ffffff, #c0c0c0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
    },
    gaming: {
      fontFamily: 'Orbitron, monospace',
      fontWeight: 700,
      textShadow: '0 0 5px #ff0080, 0 0 10px #ff0080, 0 0 15px #ff0080',
      color: '#ffffff',
      WebkitTextStroke: '1px #ff0080'
    },
    outline: {
      fontFamily: 'Arial Black, sans-serif',
      fontWeight: 900,
      WebkitTextStroke: '3px #000000',
      color: '#ffffff',
      textShadow: '2px 2px 0px rgba(0,0,0,0.8)'
    }
  };

  const applyPreset = (presetName) => {
    const preset = textEffectPresets[presetName];
    if (preset && selectedText) {
      onUpdate(selectedText.id, {
        ...selectedText,
        ...preset,
        fontSize: selectedText.fontSize || 60 // Ensure large size for thumbnail readability
      });
    }
  };

  // Computed floating style
  const style = useMemo(() => {
    const baseW = isMobile ? 260 : 380;
    const base = { width: baseW, position: "fixed", zIndex: 60 };
    if (pinned) {
      return { ...base, left: customPos.x, top: customPos.y };
    }
    if (!position) return { ...base, left: 12, top: 12 };
    const viewportW = window.innerWidth || 360;
    const viewportH = window.innerHeight || 640;
    const prefTop = Math.max(8, position.top - (isMobile ? 72 : 120) - 8);
    const belowTop = Math.min(viewportH - (isMobile ? 72 : 140) - 8, position.top + position.height + 8);
    const left = Math.min(Math.max(8, position.left + position.width / 2 - baseW / 2), viewportW - baseW - 8);
    const top = prefTop > 8 ? prefTop : belowTop;
    return { ...base, left, top };
  }, [position, pinned, customPos, isMobile]);

  // Dragging toolbar (mobile)
  const onDragStart = (e) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      active: true,
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top
    };
    setPinned(true);
    e.preventDefault();
  };
  const onDragMove = (e) => {
    if (!dragRef.current.active) return;
    const x = Math.max(8, Math.min((window.innerWidth - (isMobile ? 260 : 380) - 8), e.clientX - dragRef.current.dx));
    const y = Math.max(8, Math.min((window.innerHeight - (isMobile ? 72 : 140) - 8), e.clientY - dragRef.current.dy));
    setCustomPos({ x, y });
  };
  const onDragEnd = () => {
    dragRef.current.active = false;
  };

  useEffect(() => {
    const up = () => onDragEnd();
    const move = (e) => onDragMove(e);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  // CONDITIONAL RETURN AFTER ALL HOOKS
  if (!selectedText) return null;

  return (
    <div
      ref={boxRef}
      className={`inline-text-toolbar rounded-xl border bg-neutral-900/95 backdrop-blur-md p-4 shadow-2xl max-w-80 ${isMobile ? "border-neutral-800" : "border-neutral-700"}`}
      style={style}
    >
      {/* Header / Drag Handle */}
      <div
        className="flex items-center justify-between pl-3 pr-2 py-1.5 border-b border-neutral-800 cursor-grab active:cursor-grabbing" // Adjusted padding for new outer p-4
        onPointerDown={onDragStart}
      >
        <div className="flex items-center gap-2 text-neutral-300 text-xs">
          <Move className="w-3.5 h-3.5" />
          <span>עריכה מהירה</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onDelete?.(selectedText.id)} className="h-7 w-7 text-red-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-neutral-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main content area wrapped with space-y-4 */}
      <div className="space-y-4 pt-3"> {/* Added pt-3 for spacing below header */}

        {/* NEW: Quick Effect Presets */}
        <div>
          <Label className="text-xs font-medium text-neutral-300 hebrew-font mb-2 block">
            אפקטים מהירים (FLUX.1 Kontext Pro)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset('impact')}
              className="text-xs hebrew-font bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30"
            >
              דרמטי
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset('neon')}
              className="text-xs hebrew-font bg-green-500/20 border-green-500/50 hover:bg-green-500/30"
            >
              נאון
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset('metallic')}
              className="text-xs hebrew-font bg-gray-500/20 border-gray-500/50 hover:bg-gray-500/30"
            >
              מתכת
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset('gaming')}
              className="text-xs hebrew-font bg-pink-500/20 border-pink-500/50 hover:bg-pink-500/30"
            >
              גיימינג
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyPreset('outline')}
              className="text-xs hebrew-font bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30"
            >
              קונטור
            </Button>
          </div>
        </div>

        {/* Enhanced Text Shadow with presets */}
        <div>
          <Label className="text-xs font-medium text-neutral-300 hebrew-font mb-2 block">
            צל טקסט
          </Label>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(selectedText.id, { ...selectedText, textShadow: 'none' })}
              className="text-xs hebrew-font"
            >
              ללא
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(selectedText.id, { ...selectedText, textShadow: '2px 2px 4px rgba(0,0,0,0.8)' })}
              className="text-xs hebrew-font"
            >
              בסיסי
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(selectedText.id, { ...selectedText, textShadow: '0 0 10px rgba(255,255,255,0.8)' })}
              className="text-xs hebrew-font"
            >
              זוהר
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(selectedText.id, { ...selectedText, textShadow: '4px 4px 0px #000000, -2px -2px 0px #000000, 2px -2px 0px #000000, -2px 2px 0px #000000' })}
              className="text-xs hebrew-font"
            >
              חזק
            </Button>
          </div>
        </div>

        {/* Text field (single-line or multiline) - Existing compact controls, now within space-y-4 */}
        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => applyText(e.target.value)}
            placeholder="טקסט..."
            className="h-8 bg-neutral-800 border-neutral-700 text-neutral-100"
            dir="rtl"
          />
        </div>

        {/* Row: size, align, stroke */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="h-8 w-8 bg-neutral-800 text-neutral-200" onClick={() => nudgeFont(-4)} title="קטן יותר">
            <Minus className="w-4 h-4" />
          </Button>
          <div className="text-xs text-neutral-300 w-16 text-center select-none">{Math.round(fontSize)}</div>
          <Button variant="secondary" size="icon" className="h-8 w-8 bg-neutral-800 text-neutral-200" onClick={() => nudgeFont(4)} title="גדול יותר">
            <Plus className="w-4 h-4" />
          </Button>

          <div className="flex-1 flex items-center justify-end gap-1">
            <Button variant={align === "right" ? "default" : "secondary"} size="icon" className="h-8 w-8"
              onClick={() => applyAlign("right")} title="יישור לימין">
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button variant={align === "center" ? "default" : "secondary"} size="icon" className="h-8 w-8"
              onClick={() => applyAlign("center")} title="מרכז">
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button variant={align === "left" ? "default" : "secondary"} size="icon" className="h-8 w-8"
              onClick={() => applyAlign("left")} title="יישור לשמאל">
              <AlignLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Colors: solid vs gradient */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700">
            <Palette className="w-3.5 h-3.5 text-neutral-300" />
            <span className="text-xs text-neutral-300">גרדיאנט</span>
            <Switch checked={gradEnabled} onCheckedChange={applyGradEnabled} />
          </div>

          {!gradEnabled ? (
            <label className="flex items-center gap-2 text-xs text-neutral-300">
              צבע
              <input type="color" value={color} onChange={(e) => applyColor(e.target.value)} className="h-7 w-7 rounded border-0 bg-transparent p-0" />
            </label>
          ) : (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-neutral-300">
                A
                <input type="color" value={gradColors[0]} onChange={(e) => applyGradColor(0, e.target.value)} className="h-6 w-6 rounded border-0 bg-transparent p-0" />
              </label>
              <label className="flex items-center gap-1 text-xs text-neutral-300">
                B
                <input type="color" value={gradColors[1]} onChange={(e) => applyGradColor(1, e.target.value)} className="h-6 w-6 rounded border-0 bg-transparent p-0" />
              </label>
              <label className="flex items-center gap-1 text-xs text-neutral-300">
                C
                <input type="color" value={gradColors[2]} onChange={(e) => applyGradColor(2, e.target.value)} className="h-6 w-6 rounded border-0 bg-transparent p-0" />
              </label>
              <Select value={gradDir} onValueChange={applyGradDir}>
                <SelectTrigger className="h-8 w-28 bg-neutral-800 border-neutral-700 text-neutral-200">
                  <SelectValue placeholder="כיוון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">אנכי</SelectItem>
                  <SelectItem value="horizontal">אופקי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Stroke */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            קו מתאר
            <input type="color" value={strokeColor} onChange={(e) => applyStrokeColor(e.target.value)} className="h-6 w-6 rounded border-0 bg-transparent p-0" />
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={strokeWidth}
            onChange={(e) => applyStrokeWidth(e.target.value)}
            className="flex-1 accent-purple-500"
          />
          <div className="text-xs text-neutral-300 w-6 text-center">{strokeWidth}</div>
        </div>

        {/* NEW: Typography Tips */}
        <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
          <p className="text-xs text-neutral-400 hebrew-font">
            💡 לטאמבנייל אפקטיבי: השתמשו בפונטים גדולים (60+), ניגודיות חזקה, ומעט טקסט
          </p>
        </div>
      </div> {/* End of main content area wrapper */}
    </div>
  );
}