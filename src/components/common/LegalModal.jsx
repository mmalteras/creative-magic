import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import PrivacyPolicyContent from '@/components/legal/PrivacyPolicyContent';
import TermsOfUseContent from '@/components/legal/TermsOfUseContent';

export default function LegalModal({ activeModal, setActiveModal }) {
  if (!activeModal) return null;

  const titles = {
    privacy: "מדיניות פרטיות",
    terms: "תקנון שימוש"
  };

  return (
    <Dialog open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
      <DialogContent className="sm:max-w-4xl bg-white text-gray-900 hebrew-font p-0 z-[9999]" dir="rtl" style={{ zIndex: 9999 }}>
        <DialogHeader className="p-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-900">{titles[activeModal]}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {activeModal === 'privacy' && <PrivacyPolicyContent />}
          {activeModal === 'terms' && <TermsOfUseContent />}
        </div>
      </DialogContent>
    </Dialog>
  );
}