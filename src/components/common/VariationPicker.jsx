import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function VariationPicker({ images = [], onCancel, onConfirm }) {
  const [selected, setSelected] = React.useState(0);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-neutral-800">
          <h3 className="text-lg font-bold text-neutral-100 hebrew-font">בחרו את התוצאה המועדפת</h3>
          <button onClick={onCancel} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((b64, idx) => {
              const isActive = selected === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelected(idx)}
                  className={`relative rounded-xl overflow-hidden border transition-all ${
                    isActive ? "border-purple-500 ring-2 ring-purple-500/40" : "border-neutral-700 hover:border-neutral-600"
                  }`}
                >
                  <img
                    src={`data:image/png;base64,${b64}`}
                    alt={`וריאציה ${idx + 1}`}
                    className="w-full aspect-video object-cover"
                  />
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-purple-600/90 text-white rounded-full p-1.5">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onCancel} className="hebrew-font border-neutral-700 text-neutral-200">
              ביטול
            </Button>
            <Button onClick={() => onConfirm(selected)} className="hebrew-font bg-gradient-to-r from-purple-600 to-pink-600">
              בחרו וריאציה זו
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}