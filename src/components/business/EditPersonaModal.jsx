import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EditPersonaModal({ isOpen, setIsOpen, persona, onSave }) {
  const [editedPersona, setEditedPersona] = useState(persona);

  useEffect(() => {
    if (persona) {
        setEditedPersona(persona);
    }
  }, [persona]);

  if (!isOpen || !persona || !editedPersona) return null;

  const handleSave = () => {
    onSave(editedPersona);
    setIsOpen(false);
  };

  const handleChange = (field, value) => {
    setEditedPersona(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md hebrew-font" dir="rtl">
        <DialogHeader>
          <DialogTitle>ערוך דמות קהל יעד</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">שם הדמות</Label>
            <Input id="name" value={editedPersona.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_age" className="text-sm font-medium text-gray-700">גיל מינימום</Label>
              <Input id="min_age" type="number" value={editedPersona.min_age || ''} onChange={(e) => handleChange('min_age', parseInt(e.target.value) || '')} />
            </div>
            <div>
              <Label htmlFor="max_age" className="text-sm font-medium text-gray-700">גיל מקסימום</Label>
              <Input id="max_age" type="number" value={editedPersona.max_age || ''} onChange={(e) => handleChange('max_age', parseInt(e.target.value) || '')} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="psychographics" className="text-sm font-medium text-gray-700">תיאור (פסיכוגרפיה)</Label>
            <Textarea id="psychographics" value={editedPersona.psychographics || ''} onChange={(e) => handleChange('psychographics', e.target.value)} className="min-h-48" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="awareness_level" className="text-sm font-medium text-gray-700">רמת מודעות (1-4)</Label>
              <Input id="awareness_level" type="number" min="1" max="4" value={editedPersona.awareness_level || ''} onChange={(e) => handleChange('awareness_level', parseInt(e.target.value) || '')} />
            </div>
            <div>
              <Label htmlFor="sophistication_level" className="text-sm font-medium text-gray-700">רמת תחכום</Label>
              <Select value={editedPersona.sophistication_level || ''} onValueChange={(value) => handleChange('sophistication_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר רמה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מתחיל">מתחיל</SelectItem>
                  <SelectItem value="ביניים">ביניים</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t px-6 pb-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>ביטול</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-teal-500 text-white">שמור שינויים</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}