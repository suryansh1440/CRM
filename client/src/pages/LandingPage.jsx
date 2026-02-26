import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Zap, CheckCircle, Loader, Star, Shield, Lock } from 'lucide-react';
import { createLead } from '../services/api';
import { setCurrentLead } from '../store/leadSlice';

const LandingPage = () => {
    const { register, handleSubmit, formState: { errors, isValid }, watch, trigger } = useForm({
        mode: 'onChange' // For real-time validation
    });
    const [step, setStep] = useState(1);
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
                    window.fbq('track', 'Lead');

                    if (data.monthlyBudget === '50k+') {
                        window.fbq('track', 'QualifiedLead');
                    }
                }

                localStorage.setItem('currentLeadId', res.data._id);
                dispatch(setCurrentLead(res.data)); // Storing in Redux for BookingPage
                if (action === 'download') {
                    window.location.href = 'https://www.bitlancetechhub.com/';
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
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center gap-16">

                {/* Left Column: Copy */}
                <div className="lg:w-1/2 flex flex-col items-start text-left space-y-8 relative">

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1]">
                        Stop Losing <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                            High-Intent Leads
                        </span><br />
                        Every Week.
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-400 max-w-lg leading-relaxed font-medium">
                        Turn Ad Clicks into Qualified, Booked Sales Calls — Automatically.
                    </p>

                    <div className="flex items-center space-x-2 text-sm text-neutral-500 font-medium">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 z-${5 - i}`}>
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="pl-3">Trusted by 120+ growing service businesses.</span>
                    </div>

                    <div className="space-y-4 text-neutral-300 w-full mt-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                        <h3 className="font-semibold text-white mb-2 flex items-center"><Zap className="w-5 h-5 text-yellow-500 mr-2" /> What you actually get:</h3>
                        {['Automated 24/7 Follow-Ups', 'Qualified Leads Only', 'Zero Manual Tracking', 'Calendar Filled With Sales Calls'].map((feature, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="font-medium text-neutral-200">{feature}</span>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Right Column: 2-Step Smart Form */}
                <div className="lg:w-1/2 w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] overflow-hidden relative" id="demo">
                    {/* Subtle gradient glow behind form */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="p-8 sm:p-10">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between pl-1 mb-8">
                            <span className="text-xs font-bold tracking-widest uppercase text-blue-500">Step {step} of 2</span>
                            <div className="flex space-x-2">
                                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-neutral-800'}`}></div>
                                <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-neutral-800'}`}></div>
                            </div>
                        </div>

                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Let's customize your growth plan.</h2>
                                <p className="text-neutral-400 text-sm mb-8">What industry are you in?</p>

                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); }}>

                                    <div className="space-y-3">
                                        {['Real Estate', 'Clinic', 'Education', 'Other'].map((type) => (
                                            <label
                                                key={type}
                                                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${watch('businessType') === type ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-900 hover:border-neutral-700'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={type}
                                                    {...register("businessType", { required: true })}
                                                    className="w-4 h-4 text-blue-500 bg-neutral-900 border-neutral-700 focus:ring-blue-500 focus:ring-offset-neutral-900 focus:ring-2"
                                                />
                                                <span className={`ml-3 font-semibold ${watch('businessType') === type ? 'text-white' : 'text-neutral-300'}`}>{type}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        disabled={!watch('businessType')}
                                        onClick={async () => {
                                            const isValidStep = await trigger("businessType");
                                            if (isValidStep) setStep(2);
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 bg-white text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-200 px-6 py-4 rounded-xl font-bold transition-all outline-none focus:ring-4 focus:ring-white/20 mt-4"
                                    >
                                        <span>Continue</span>
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Almost there.</h2>
                                <p className="text-neutral-400 text-sm mb-8">Where should we send your blueprint?</p>

                                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            {...register("name", { required: true })}
                                            className={`w-full bg-neutral-950 border ${errors.name ? 'border-red-500' : 'border-neutral-800'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder:text-neutral-600`}
                                            placeholder="Jane Doe"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Work Email</label>
                                        <input
                                            type="email"
                                            {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                                            className={`w-full bg-neutral-950 border ${errors.email ? 'border-red-500' : 'border-neutral-800'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder:text-neutral-600`}
                                            placeholder="jane@company.com"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            {...register("phone", { required: true })}
                                            className={`w-full bg-neutral-950 border ${errors.phone ? 'border-red-500' : 'border-neutral-800'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium placeholder:text-neutral-600`}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Monthly Marketing Budget</label>
                                        <select
                                            {...register("monthlyBudget", { required: true })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none font-medium"
                                        >
                                            <option value="" disabled selected>Select an option</option>
                                            <option value="< 10k">Under $10k / mo</option>
                                            <option value="10k - 50k">$10k - $50k / mo</option>
                                            <option value="50k+">$50k+ / mo</option>
                                        </select>
                                    </div>

                                    {/* Primary CTA */}
                                    <div className="pt-4 space-y-4">
                                        <button
                                            type="button"
                                            disabled={!isValid || loading}
                                            onClick={handleSubmit((data) => onSubmit(data, 'book'))}
                                            className="w-full flex items-center justify-center space-x-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] transition-all outline-none focus:ring-4 focus:ring-blue-500/30 text-lg"
                                        >
                                            {loading ? (
                                                <Loader className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <span>Book My Free Strategy Call</span>
                                            )}
                                        </button>

                                        {/* Security / Trust text under button */}
                                        <div className="flex items-center justify-center text-xs text-neutral-500 space-x-1.5">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Your information is 100% secure. No spam ever.</span>
                                        </div>

                                        {/* Secondary CTA */}
                                        <div className="pt-2 pb-1 text-center">
                                            <button
                                                type="button"
                                                disabled={!isValid || loading}
                                                onClick={handleSubmit((data) => onSubmit(data, 'download'))}
                                                className="text-sm font-medium text-neutral-500 hover:text-white underline underline-offset-4 decoration-neutral-700 hover:decoration-neutral-400 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
                                            >
                                                Nah, just let me download the Blueprint PDF
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-neutral-800">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center"
                                        >
                                            ← Back to previous step
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            {/* Trust Bar Section */}
            <section className="border-y border-neutral-800/80 bg-neutral-900/30 py-10 mt-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-neutral-800 text-center">
                    <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                        <div className="text-3xl font-black text-white mb-1">127+</div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Clients Automated</div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <div className="text-3xl font-black text-white mb-1">1,200+</div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Qualified Calls Generated</div>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <div className="flex items-center space-x-1 mb-2 text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" className="w-6 h-6" />)}
                        </div>
                        <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest">4.9/5 Client Satisfaction</div>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-24 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Here's What Our Clients Are Saying</h2>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Real results from real founders who decided to stop doing manual outreach.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Testimonial 1 */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl relative">
                        <Star className="absolute top-6 right-6 w-8 h-8 text-neutral-800/50" fill="currentColor" />
                        <p className="text-lg text-neutral-300 italic mb-6">"We went from 5 leads a week to 25 booked calls in 30 days. AutoSync replaced our SDR completely, and the leads are actually qualified."</p>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-lg">M</div>
                            <div>
                                <div className="font-bold text-white">Marcus T.</div>
                                <div className="text-sm text-neutral-500">Real Estate Agency Owner</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl relative">
                        <Star className="absolute top-6 right-6 w-8 h-8 text-neutral-800/50" fill="currentColor" />
                        <p className="text-lg text-neutral-300 italic mb-6">"I used to spend 3 hours a day just following up via email and text. Now, I just wake up and check my Google Calendar. Best decision ever."</p>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">S</div>
                            <div>
                                <div className="font-bold text-white">Sarah Jenkins</div>
                                <div className="text-sm text-neutral-500">Clinic Director</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
