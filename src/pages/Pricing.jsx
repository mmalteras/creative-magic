
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { CreditPackage } from "@/api/entities";
import { SubscriptionPlan } from "@/api/entities";
import { paypalCreateOrder } from "@/api/functions";
import { paypalCaptureOrder } from "@/api/functions";
import { paypalActivateSubscription } from "@/api/functions";
import { getPaypalConfig } from "@/api/functions";
import { Loader2, CheckCircle, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import LoadingDots from "@/components/common/LoadingDots";
import PageHeader from "@/components/common/PageHeader";
import LoginModal from "@/components/common/LoginModal";

export default function PricingPage() {
    const [user, setUser] = useState(null);
    const [packages, setPackages] = useState([]);
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [sdkReady, setSdkReady] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, packagesData, plansData, configResult] = await Promise.all([
                    User.me().catch(() => null),
                    CreditPackage.filter({ is_active: true }, 'sort_order'),
                    SubscriptionPlan.filter({ is_active: true }),
                    getPaypalConfig()
                ]);

                if (configResult.error || !configResult.data.clientId) {
                    throw new Error("Could not load PayPal configuration.");
                }
                const paypalClientId = configResult.data.clientId;

                setUser(userData);
                // Show only first 2 packages
                setPackages(packagesData.slice(0, 2));
                setPlans(plansData);

                const script = document.createElement("script");
                script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=ILS&components=buttons,applepay&intent=capture&vault=true&enable-funding=card`;
                script.onload = () => setSdkReady(true);
                script.onerror = () => setError("Failed to load PayPal SDK.");
                document.body.appendChild(script);

            } catch (e) {
                setError("שגיאה בטעינת החבילות והתצורה: " + e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const jsonLd = useMemo(() => {
        if (!packages.length && !plans.length) return null;
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const ogImage = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e50d6f772_ThumbGenius.jpg";

        const offers = [
            ...packages.map((pkg) => ({
                "@type": "Offer",
                name: pkg.name,
                price: Number(pkg.price || 0),
                priceCurrency: pkg.currency || "ILS",
                url: baseUrl + "/#pricing",
                availability: "https://schema.org/InStock"
            })),
            ...plans.map((plan) => ({
                "@type": "Offer",
                name: `${plan.name} Subscription`,
                price: Number(plan.price || 0),
                priceCurrency: plan.currency || "ILS",
                url: baseUrl + "/#pricing",
                availability: "https://schema.org/InStock"
            }))
        ];

        const schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ThumbGenius",
            applicationCategory: "DesignApplication",
            operatingSystem: "Web",
            url: baseUrl,
            image: ogImage,
            description: "ThumbGenius – כלי AI בעברית ליצירת תמונות ממוזערות וקאברים ליוטיוב ואינסטגרם.",
            offers
        };

        return JSON.stringify(schema);
    }, [packages, plans]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LoadingDots color="bg-purple-500" />
                <p className="text-gray-600 hebrew-font">טוען חבילות...</p>
            </div>
        );
    }

    const OneTimePurchaseButtons = ({ pkg, sdkReady }) => {
        const [isPaying, setIsPaying] = useState(false);
        const currentUser = user;

        useEffect(() => {
            if (currentUser && sdkReady && window.paypal) {
                const renderButtons = () => {
                    const containerId = `paypal-button-container-${pkg.package_id}`;
                    if (!document.getElementById(containerId)) return;
                    document.getElementById(containerId).innerHTML = '';

                    const baseConfig = {
                        style: { layout: 'vertical', shape: 'pill', label: 'pay', height: 44, tagline: false },
                        createOrder: async () => {
                            setIsPaying(true);
                            setError("");
                            try {
                                const { data } = await paypalCreateOrder({ packageId: pkg.package_id });
                                if (!data || !data.id) throw new Error("לא התקבלה הזמנה מ-PayPal");
                                return data.id;
                            } catch (e) {
                                setError(`שגיאה ביצירת ההזמנה: ${e.message}`);
                                setIsPaying(false);
                                return null;
                            }
                        },
                        onApprove: async (data) => {
                            try {
                                await paypalCaptureOrder({ orderID: data.orderID });
                                alert('התשלום הושלם בהצלחה! הקרדיטים נוספו לחשבונך.');
                                window.location.reload();
                            } catch (e) {
                                setError("שגיאה באישור התשלום.");
                            } finally {
                                setIsPaying(false);
                            }
                        },
                        onError: (err) => {
                            setError("אירעה שגיאה בתהליך התשלום.");
                            console.error("PayPal Error:", err);
                            setIsPaying(false);
                        },
                        onCancel: () => {
                            setIsPaying(false);
                        }
                    };

                    window.paypal.Buttons(baseConfig).render(`#${containerId}`);
                };
                renderButtons();
            }
        }, [sdkReady, pkg, currentUser]);

        if (!currentUser) {
            return (
                <Button
                    className="w-full btn-gradient"
                    onClick={() => setShowLoginModal(true)}
                >
                    התחברות לרכישה
                </Button>
            );
        }

        return (
            <div className="w-full mt-auto">
                {isPaying && <div className="flex justify-center items-center mb-2 text-gray-600"><Loader2 className="animate-spin w-5 h-5 mr-2" />מעבד תשלום...</div>}
                <div id={`paypal-button-container-${pkg.package_id}`} className="min-h-[50px]" />
            </div>
        )
    };

    const SubscriptionButton = ({ plan, sdkReady }) => {
        const [isPaying, setIsPaying] = useState(false);
        const currentUser = user;

        useEffect(() => {
            if (sdkReady && window.paypal && plan.paypal_plan_id !== "P-YOUR-PLAN-ID-HERE") {
                const renderButtons = () => {
                    const container = document.getElementById(`paypal-subscription-button-container-${plan.paypal_plan_id}`);
                    if (!container) return;
                    container.innerHTML = '';

                    window.paypal.Buttons({
                        style: { layout: 'vertical', shape: 'rect', label: 'subscribe', color: 'blue', height: 50 },
                        createSubscription: (data, actions) => {
                            setIsPaying(true);
                            setError("");
                            return actions.subscription.create({ plan_id: plan.paypal_plan_id });
                        },
                        onApprove: async (data) => {
                            try {
                                await paypalActivateSubscription({ subscriptionID: data.subscriptionID, planId: plan.paypal_plan_id });
                                alert('המנוי הופעל בהצלחה! הקרדיטים יתעדכנו אוטומטית.');
                                window.location.reload();
                            } catch (e) {
                                setError("שגיאה בהפעלת המנוי.");
                            } finally {
                                setIsPaying(false);
                            }
                        },
                        onError: (err) => {
                            setError("אירעה שגיאה בתהליך המנוי.");
                            console.error("PayPal Subscription Error:", err);
                            setIsPaying(false);
                        },
                        onCancel: () => {
                            setIsPaying(false);
                        }
                    }).render(`#paypal-subscription-button-container-${plan.paypal_plan_id}`);
                };
                renderButtons();
            }
        }, [sdkReady, plan, currentUser]);

        if (plan.paypal_plan_id === "P-YOUR-PLAN-ID-HERE") {
            return (
                <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="font-bold hebrew-font">מנוי דמו</AlertTitle>
                    <AlertDescription className="text-sm hebrew-font">
                        המנוי יהיה זמין בקרוב. כרגע ניתן לרכוש חבילות קרדיטים בלבד.
                    </AlertDescription>
                </Alert>
            )
        }

        if (currentUser?.subscription_status === 'active') {
            return <div className="text-center text-teal-600 font-bold flex items-center justify-center gap-2 hebrew-font"><CheckCircle className="w-5 h-5" /> אתה כבר מנוי!</div>
        }

        return (
            <div className="w-full">
                {isPaying && <div className="flex justify-center items-center mb-2 text-gray-600 hebrew-font"><Loader2 className="animate-spin w-5 h-5 mr-2" />מעבד מנוי...</div>}
                <div id={`paypal-subscription-button-container-${plan.paypal_plan_id}`} className="min-h-[50px]" />
            </div>
        )
    }

    return (
        <div className="flex-grow flex flex-col p-4 md:p-8 bg-gray-100" dir="rtl">
            <LoginModal isOpen={showLoginModal} setIsOpen={setShowLoginModal} />
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
            <div className="max-w-6xl mx-auto flex-grow flex flex-col">
                <PageHeader
                    title="שדרגו ותיצרו בלי מעצורים"
                    subtitle="בחרו בין מנוי משתלם לקרדיטים חד־פעמיים – והתחילו להפוך רעיונות לקאברים מדויקים"
                />

                {error && <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto"><AlertDescription className="hebrew-font">{error}</AlertDescription></Alert>}

                <div className="flex-grow flex items-center justify-center">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-5xl">

                        {/* Package 1 */}
                        {packages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 h-full flex flex-col p-6 text-center">
                                    <CardHeader className="p-0">
                                        <CardTitle className="text-2xl font-bold hebrew-font text-gray-800">{packages[0].name}</CardTitle>
                                        <CardDescription className="text-gray-500 hebrew-font mt-1">{packages[0].credits} קרדיטים</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 flex flex-col justify-center items-center my-6">
                                        <div className="text-5xl font-extrabold text-gray-900">₪{packages[0].price}</div>
                                        <p className="text-gray-500 text-sm mt-1 hebrew-font">תשלום חד פעמי</p>
                                    </CardContent>
                                    <OneTimePurchaseButtons pkg={packages[0]} sdkReady={sdkReady} />
                                </Card>
                            </motion.div>
                        )}

                        {/* Subscription Plan (Highlighted) */}
                        {plans.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden shadow-2xl bg-white border-2 border-purple-500 p-6 h-full flex flex-col text-center">
                                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-gradient-to-br from-purple-500 to-teal-400 rounded-full opacity-10 blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-gradient-to-br from-teal-500 to-purple-400 rounded-full opacity-10 blur-2xl"></div>

                                    <CardHeader className="p-0 relative">
                                        <div className="inline-flex mx-auto items-center gap-2 bg-gradient-to-r from-purple-100 to-teal-100 text-purple-700 font-semibold px-3 py-1 rounded-full text-sm hebrew-font mb-4">
                                            <Star className="w-4 h-4" />
                                            הכי משתלם
                                        </div>
                                        <CardTitle className="text-3xl font-bold hebrew-font text-gray-900">{plans[0].name}</CardTitle>
                                        <CardDescription className="text-gray-600 text-base mt-1 hebrew-font">{plans[0].credits_per_cycle} קרדיטים מתחדשים מדי חודש</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 flex flex-col justify-center items-center my-6">
                                        <div className="text-5xl font-extrabold text-gray-900">₪{plans[0].price}<span className="text-xl font-normal text-gray-500 hebrew-font">/חודש</span></div>
                                    </CardContent>
                                    <div className="mt-auto">
                                        <SubscriptionButton plan={plans[0]} sdkReady={sdkReady} />
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Package 2 */}
                        {packages.length > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 h-full flex flex-col p-6 text-center">
                                    <CardHeader className="p-0">
                                        <CardTitle className="text-2xl font-bold hebrew-font text-gray-800">{packages[1].name}</CardTitle>
                                        <CardDescription className="text-gray-500 hebrew-font mt-1">{packages[1].credits} קרדיטים</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 flex flex-col justify-center items-center my-6">
                                        <div className="text-5xl font-extrabold text-gray-900">₪{packages[1].price}</div>
                                        <p className="text-gray-500 text-sm mt-1 hebrew-font">תשלום חד פעמי</p>
                                    </CardContent>
                                    <OneTimePurchaseButtons pkg={packages[1]} sdkReady={sdkReady} />
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
