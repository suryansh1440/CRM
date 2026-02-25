import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Zap, CheckCircle, ArrowRight, Loader, Calendar } from 'lucide-react';
import { createLead } from '../services/api';
import { setCurrentLead } from '../store/leadSlice';

const LandingPage = () => {
    const { register, handleSubmit, formState: { errors, isValid } } = useForm({
        mode: 'onChange' // For real-time validation
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Extract UTMs on mount and save to localStorage for persistence
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        // If the URL has tracking params, or we don't have stored data yet
        if (params.has('utm_source') || params.has('utm_campaign') || params.has('fbclid')) {
            const utm = {
                utmSource: params.get('utm_source') || '',
                utmMedium: params.get('utm_medium') || '',
                utmCampaign: params.get('utm_campaign') || '',
                utmContent: params.get('utm_content') || '',
                utmTerm: params.get('utm_term') || '',
                fbclid: params.get('fbclid') || '',
                referrer: document.referrer || 'Direct'
            };
            localStorage.setItem('utmData', JSON.stringify(utm));
        } else if (!localStorage.getItem('utmData')) {
            // Default fallback if absolutely no tracking history
            localStorage.setItem('utmData', JSON.stringify({ referrer: document.referrer || 'Direct' }));
        }
    }, [location]);

    const onSubmit = async (data, action) => {
        setLoading(true);
        try {
            const storedUtm = JSON.parse(localStorage.getItem('utmData') || '{}');
            const payload = { ...data, ...storedUtm, action };
            const res = await createLead(payload);

            if (res.success) {
                // Meta Pixel Tracking
                if (typeof window !== 'undefined' && window.fbq) {
                    const trackData = {
                        ...(storedUtm.fbclid && { fbclid: storedUtm.fbclid }),
                        ...(storedUtm.utmSource && { utm_source: storedUtm.utmSource }),
                        ...(storedUtm.utmMedium && { utm_medium: storedUtm.utmMedium }),
                        ...(storedUtm.utmCampaign && { utm_campaign: storedUtm.utmCampaign }),
                        ...(storedUtm.utmContent && { utm_content: storedUtm.utmContent }),
                        ...(storedUtm.utmTerm && { utm_term: storedUtm.utmTerm })
                    };
                    window.fbq('track', 'Lead', trackData);
                    if (data.monthlyBudget === '50k+') {
                        window.fbq('trackCustom', 'QualifiedLead', trackData);
                    }
                }

                localStorage.setItem('currentLeadId', res.data._id);
                dispatch(setCurrentLead(res.data)); // Storing in Redux for BookingPage
                if (action === 'download') {
                    navigate('/thank-you');
                } else {
                    navigate('/booking');
                }
            }
        } catch (error) {
            console.error('Submission failed', error);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30 font-sans">

            {/* Navigation (Mock) */}
            <nav className="w-full h-20 flex justify-between items-center px-8 lg:px-24 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center space-x-2">
                    <Zap className="w-6 h-6 text-blue-500" />
                    <span className="font-bold text-xl tracking-tight">AutoSync CRM</span>
                </div>
                <a href="#demo" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                    Book Demo
                </a>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-16">

                {/* Left Column: Copy */}
                <div className="lg:w-1/2 flex flex-col items-start text-left space-y-8 relative">

                    <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Version 2.0 Live Now</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1]">
                        Automate Your <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                            Lead Generation
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-400 max-w-lg leading-relaxed">
                        Capture, qualify, and convert leads while you sleep. Stop letting potential customers slip through the cracks.
                    </p>

                    <div className="space-y-4 text-neutral-300 w-full mt-4">
                        {['24/7 Automated Follow-ups', 'Smart Lead Scoring Engine', 'Seamless CRM Integration'].map((feature, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Right Column: Smart Form */}
                <div className="lg:w-1/2 w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative" id="demo">
                    {/* Subtle gradient glow behind form */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2 tracking-tight">Get Your Blueprint</h2>
                        <p className="text-neutral-400 text-sm mb-6">See how AutoSync works for your exact business model.</p>

                        <form className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Name</label>
                                <input
                                    {...register("name", { required: true })}
                                    className={`w-full bg-neutral-950 border ${errors.name ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Work Email</label>
                                <input
                                    type="email"
                                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                    className={`w-full bg-neutral-950 border ${errors.email ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                    placeholder="john@company.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Phone</label>
                                    <input
                                        {...register("phone", { required: true })}
                                        className={`w-full bg-neutral-950 border ${errors.phone ? 'border-red-500' : 'border-neutral-800'} rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all`}
                                        placeholder="+1 234 567 890"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Business Type</label>
                                    <select
                                        {...register("businessType", { required: true })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                    >
                                        <option value="Real Estate">Real Estate</option>
                                        <option value="Clinic">Clinic</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Monthly Budget</label>
                                <select
                                    {...register("monthlyBudget", { required: true })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                >
                                    <option value="< 10k">Under $10k / mo</option>
                                    <option value="10k - 50k">$10k - $50k / mo</option>
                                    <option value="50k+">$50k+ / mo</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 pt-2">
                                <input
                                    type="checkbox"
                                    {...register("readyToAutomate")}
                                    className="w-4 h-4 bg-neutral-900 border-neutral-700 rounded focus:ring-blue-500 text-blue-500"
                                />
                                <label className="text-sm text-neutral-400">Yes, I am ready to automate my sales funnel.</label>
                            </div>

                            {/* Dynamic CTAs */}
                            <div className="pt-6 space-y-3">
                                <button
                                    type="button"
                                    disabled={!isValid || loading}
                                    onClick={handleSubmit((data) => onSubmit(data, 'download'))}
                                    className="w-full relative group bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-lg font-medium transition-all"
                                >
                                    {loading ? <Loader className="w-5 h-5 mx-auto animate-spin" /> : 'Download Free Guide (PDF)'}
                                </button>

                                <div className="relative flex items-center py-1">
                                    <div className="grow border-t border-neutral-800"></div>
                                    <span className="shrink-0 mx-4 text-xs text-neutral-500 uppercase font-semibold tracking-wider">or</span>
                                    <div className="grow border-t border-neutral-800"></div>
                                </div>

                                <button
                                    type="button"
                                    disabled={!isValid || loading}
                                    onClick={handleSubmit((data) => onSubmit(data, 'book'))}
                                    className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-lg font-bold shadow-lg shadow-blue-500/25 transition-all outline-none ring-2 ring-transparent focus:ring-blue-500/50"
                                >
                                    {loading ? (
                                        <Loader className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <><Calendar className="w-5 h-5" /> <span>Book Live Strategy Demo</span></>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>

            </main>
        </div>
    );
};

export default LandingPage;
