
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Globe, 
  Users, 
  Target, 
  MessageSquare, 
  Tag,
  Briefcase,
  Gem,
  ThumbsUp,
  BarChart,
  Lightbulb,
  User as UserIcon,
  HeartCrack,
  Goal,
  Quote
} from "lucide-react";

const DetailSection = ({ icon: Icon, title, children }) => (
  <div>
    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
      <Icon className="w-4 h-4 text-teal-600" />
      {title}
    </h4>
    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{children}</div>
  </div>
);

export default function BusinessDetailsModal({ isOpen, setIsOpen, business, persona }) {
  if (!business) return null;

  const awarenessMap = {
    1: 'מודע לבעיה ולפתרון, מחפש אפשרויות',
    2: 'מודע לבעיה אך לא בטוח לגבי הפתרונות',
    3: 'מודע לפתרונות אך סקפטי או מהסס',
    4: 'מרגיש את הכאב אך לא זיהה את הבעיה השורשית'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl hebrew-font max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-600" />
            {business.business_name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="space-y-6">
            
            {/* Business Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  פרטי העסק
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={business.website_url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {business.website_url}
                    </a>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">תקציר AI:</h4>
                  <p className="text-gray-700 leading-relaxed">{business.ai_summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Persona Details */}
            {persona && (
              <Card className="bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-purple-800">
                    <UserIcon className="w-5 h-5" />
                    הפרסונה הנבחרת: {persona.persona_name}
                  </CardTitle>
                   <p className="text-sm text-purple-700 pt-1 flex items-center gap-2">
                     <Quote className="w-4 h-4" />
                     {persona.tagline}
                   </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <DetailSection icon={Users} title="דמוגרפיה">
                    {`גיל: ${persona.min_age}-${persona.max_age}, ${persona.demographics || ''}`}
                  </DetailSection>

                  <DetailSection icon={Lightbulb} title="פסיכוגרפיה ותיאור">
                    {persona.psychographics}
                  </DetailSection>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <DetailSection icon={BarChart} title="רמת מודעות">
                        {`${persona.awareness_level} - ${awarenessMap[persona.awareness_level] || 'לא צוין'}`}
                    </DetailSection>
                    <DetailSection icon={Gem} title="רמת תחכום">
                      {persona.sophistication_level || 'לא צוין'}
                    </DetailSection>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailSection icon={Goal} title="מטרות">
                      {persona.goals}
                    </DetailSection>
                    <DetailSection icon={HeartCrack} title="תסכולים">
                      {persona.frustrations}
                    </DetailSection>
                  </div>

                  <DetailSection icon={MessageSquare} title="טון דיבור מומלץ">
                    {persona.tone_of_voice}
                  </DetailSection>

                  <DetailSection icon={ThumbsUp} title="ערוצי תקשורת">
                    {persona.communication_channels}
                  </DetailSection>

                  <DetailSection icon={Gem} title="משפט פתיחה לדוגמה">
                    {persona.sample_hook_line}
                  </DetailSection>

                  {persona.keywords && persona.keywords.length > 0 && (
                    <DetailSection icon={Tag} title="מילות מפתח">
                      <div className="flex flex-wrap gap-2">
                        {persona.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </DetailSection>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Creation Info */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  מידע נוסף
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500 space-y-1">
                <div>נוצר: {new Date(business.created_date).toLocaleDateString('he-IL')}</div>
                <div>עודכן: {new Date(business.updated_date).toLocaleDateString('he-IL')}</div>
                <div>נוצר על ידי: {business.created_by}</div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
