import React from "react";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, SlidersHorizontal, Download, Loader2 } from "lucide-react";

export default function MobileQuickBar({ onOpenPanel, onAddText, onAddImage, onExport, isExporting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
      <div className="mx-3 mb-3 rounded-2xl border border-neutral-700/60 bg-neutral-950/90 backdrop-blur-md shadow-2xl">
        <div className="grid grid-cols-4 gap-2 p-3">
          <div className="text-center">
            <Button
              onClick={onAddText}
              className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 flex-col gap-1"
              variant="outline"
            >
              <Type className="w-5 h-5 text-purple-400" />
              <span className="text-xs">טקסט</span>
            </Button>
          </div>
          <div className="text-center">
            <Button
              onClick={onAddImage}
              className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 flex-col gap-1"
              variant="outline"
            >
              <ImageIcon className="w-5 h-5 text-purple-400" />
              <span className="text-xs">תמונה</span>
            </Button>
          </div>
          <div className="text-center">
            <Button
              onClick={onOpenPanel}
              className="w-full h-12 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 flex-col gap-1"
            >
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <span className="text-xs">כלים</span>
            </Button>
          </div>
          <div className="text-center">
            <Button
              onClick={onExport}
              disabled={isExporting}
              className="w-full h-12 btn-gradient text-white flex-col gap-1"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              <span className="text-xs">יצוא</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}