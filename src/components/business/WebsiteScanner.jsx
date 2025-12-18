
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { Search, Globe, AlertTriangle, ArrowLeft, Clock, Loader2, CheckCircle } from 'lucide-react';
import { debounce } from 'lodash';

const scanningSteps = [
    { duration: 4, text: "בודק זמינות האתר...", description: "מוודא שהאתר זמין ונגיש לסריקה", progress: 25 },
    { duration: 8, text: "סורק את האתר שלך...", description: "מתחבר לאתר ומוריד את התוכן", progress: 60 },
    { duration: 6, text: "מנתח את תוכן האתר...", description: "מחלץ טקסטים ומוצא מידע חשוב", progress: 95 },
];

const validateAndFormatUrl = (input) => {
  let cleanInput = input.trim();
  if (!cleanInput) return { valid: false, url: null };

  if (!/^(https?:\/\/)/i.test(cleanInput)) {
      cleanInput = 'https://' + cleanInput;
  }
  
  try {
      const urlObject = new URL(cleanInput);
      // A simple check for a plausible domain with a TLD.
      if (urlObject.hostname.includes('.') && urlObject.hostname.split('.').pop().length >= 2) {
          return { valid: true, url: urlObject.href };
      }
  } catch (_) {
      return { valid: false, url: null };
  }
  return { valid: false, url: null };
};


export default function WebsiteScanner({ onScanComplete, onSkip, onAnalyze }) {
  const [urlInput, setUrlInput] = useState("");
  const [validatedUrl, setValidatedUrl] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const debouncedValidate = useMemo(
    () => debounce((input) => {
        const { valid, url } = validateAndFormatUrl(input);
        setIsValid(valid);
        setValidatedUrl(url);
    }, 300),
    [] 
  );

  useEffect(() => {
    debouncedValidate(urlInput);
    // Cleanup the debounced function on component unmount or urlInput change
    return () => {
      debouncedValidate.cancel();
    };
  }, [urlInput, debouncedValidate]);

  useEffect(() => {
    let timer;
    if (isScanning) {
        const currentStep = scanningSteps[currentStepIndex];
        setProgress(currentStep.progress);
        
        // Timer for elapsed time
        let stepStartTime = 0;
        timer = setInterval(() => {
            setElapsedTime(prev => {
                const newTime = prev + 1;
                stepStartTime += 1;
                if (stepStartTime >= currentStep.duration) {
                    if (currentStepIndex < scanningSteps.length - 1) {
                        setCurrentStepIndex(prevIndex => prevIndex + 1);
                    } else {
                        setIsScanning(false);
                        onAnalyze(validatedUrl); // Trigger the final analysis
                    }
                    stepStartTime = 0;
                }
                return newTime;
            });
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [isScanning, currentStepIndex, validatedUrl, onAnalyze]);

  const handleStartScan = () => {
    if (!isValid) return;
    setIsScanning(true);
  };
  
  const currentStep = scanningSteps[currentStepIndex];

  return (
    <div className="w-full max-w-lg mx-auto text-center" dir="rtl">
        <AnimatePresence mode="wait">
            {!isScanning ? (
                <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                >
                    <p className="text-gray-600 hebrew-font">הכנס את כתובת האתר שלך ואנחנו נלמד עליו הכל</p>

                    <div className="space-y-2">
                         <label className="block text-sm font-medium text-gray-700 hebrew-font text-right mb-1">כתובת האתר</label>
                        <Input
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="example.com"
                            className="text-center h-12 text-lg ltr"
                            dir="ltr"
                        />
                         {urlInput && (
                            <div className={`text-sm hebrew-font p-2 rounded-md flex items-center justify-center gap-2 mt-2 ${isValid ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
                                {isValid ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                {isValid ? `נסרוק את: ${validatedUrl}` : 'כתובת האתר אינה תקינה'}
                            </div>
                        )}
                    </div>
                   
                    <Button
                        onClick={handleStartScan}
                        disabled={!isValid}
                        className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        המשך
                    </Button>
                     <Button variant="link" onClick={onSkip} className="text-gray-600 hebrew-font">
                        המשך ללא סריקת אתר
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <Search className="w-12 h-12 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-purple-600 hebrew-font">{currentStep.text}</h2>
                    <p className="text-gray-600 hebrew-font">{currentStep.description}</p>
                    
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 ltr">{validatedUrl}</span>
                    </div>

                    <div className="w-full space-y-2">
                        <Progress value={progress} className="w-full h-2 bg-slate-200 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-teal-500" />
                        <div className="flex justify-between items-center text-sm text-gray-500">
                             <div className="flex items-center gap-1">
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                <span>מעבד...</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{elapsedTime}s</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

