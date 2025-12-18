
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, SlidersHorizontal, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TopBar({ projectName, onExport, isExporting, saveStatus, onToggleMobilePanel }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20 shrink-0 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={onToggleMobilePanel}
          aria-label="פתח לוח כלים"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Project name centered */}
      <div className="flex-1 flex justify-start ml-20">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800 hebrew-font">שם הקובץ:</span>
          <span className="text-base font-normal text-gray-500 hebrew-font">
            {projectName || 'פרויקט חדש'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 hebrew-font">{saveStatus}</span>
        
        <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="h-9 hebrew-font gap-2 bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-700">
                <PlusCircle className="w-4 h-4" />
                חדש
            </Button>
        </Link>
        
        <Button
          onClick={onExport}
          disabled={isExporting}
          className="h-9 px-4 font-bold text-white btn-gradient shadow-md transition-all hebrew-font"
        >
          {isExporting ? 'מייצא...' : 'יצוא תמונה'}
          {!isExporting && <Download className="w-4 h-4 mr-2" />}
        </Button>
      </div>
    </header>
  );
}
