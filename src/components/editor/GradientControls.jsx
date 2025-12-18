import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function GradientControls({ element, onChange }) {
  if (!element || element.type !== "text") return null;

  const gradient = element.gradient || { enabled: false, direction: "vertical", colors: ["#F7D14C", "#FFFFFF", "#FF7A1A"] };

  const update = (partial) => {
    onChange(element.id, { gradient: { ...gradient, ...partial } });
  };

  const updateColor = (idx, color) => {
    const next = [...gradient.colors];
    next[idx] = color;
    update({ colors: next });
  };

  const addColor = () => {
    update({ colors: [...gradient.colors, "#ffffff"] });
  };

  const removeColor = (idx) => {
    if (gradient.colors.length <= 2) return;
    const next = gradient.colors.filter((_, i) => i !== idx);
    update({ colors: next });
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-neutral-300 hebrew-font">מילוי גרדיאנט</Label>
          <Switch checked={gradient.enabled} onCheckedChange={(val) => update({ enabled: val })} />
        </div>

        {gradient.enabled && (
        <>
            <div className="space-y-2">
              <Label className="text-neutral-400 hebrew-font text-xs">כיוון</Label>
              <Select value={gradient.direction || "vertical"} onValueChange={(v) => update({ direction: v })}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200">
                  <SelectValue placeholder="בחר כיוון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">אנכי</SelectItem>
                  <SelectItem value="horizontal">אופקי</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-neutral-400 hebrew-font text-xs">צבעים</Label>
                <Button size="sm" variant="ghost" onClick={addColor} className="hebrew-font text-purple-400 hover:text-purple-300">
                  <Plus className="w-4 h-4 ml-1" /> הוסף
                </Button>
              </div>
              <div className="space-y-2">
                {gradient.colors.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <input
                      type="color"
                      value={c}
                      onChange={(e) => updateColor(idx, e.target.value)}
                      className="h-8 w-8 bg-transparent rounded border border-neutral-700 p-0"
                      title={`בחר צבע ${idx + 1}`}
                    />
                    <span className="text-neutral-300 text-sm font-mono flex-1 truncate">{c}</span>
                    <Button size="icon" variant="ghost" onClick={() => removeColor(idx)} disabled={gradient.colors.length <= 2}>
                      <Trash2 className="w-4 h-4 text-neutral-500 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
        </>
        )}
    </div>
  );
}