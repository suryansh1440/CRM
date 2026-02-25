import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { setCurrentLead } from '../store/leadSlice';
import { useDispatch, useSelector } from 'react-redux';
import { markAsBooked, getLeadById } from '../services/api';

const BookingPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [leadId, setLeadId] = useState(null);
    const { currentLead } = useSelector((state) => state.lead || {});

    useEffect(() => {
        const fetchLeadData = async () => {
            const storedId = localStorage.getItem('currentLeadId');
            if (storedId) {
                setLeadId(storedId);
                // Hydrate Redux if it was lost on refresh
                if (!currentLead || currentLead._id !== storedId) {
                    try {
                        const res = await getLeadById(storedId);
                        if (res.success) dispatch(setCurrentLead(res.data));
                    } catch (error) {
                        console.error('Failed to restore lead session:', error);
                    }
                }
            }
        };
        fetchLeadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useCalendlyEventListener({
        onEventScheduled: async (e) => {
            console.log("Calendly Event Scheduled:", e.data.payload);

            // Extract Calendly booking URI from the payload
            if (leadId || currentLead?._id) {
                try {
                    // Meta Pixel Tracking
                    if (typeof window !== 'undefined' && window.fbq) {
                        const trackData = {
                            ...(currentLead?.fbclid && { fbclid: currentLead.fbclid }),
                            ...(currentLead?.utmSource && { utm_source: currentLead.utmSource }),
                            ...(currentLead?.utmMedium && { utm_medium: currentLead.utmMedium }),
                            ...(currentLead?.utmCampaign && { utm_campaign: currentLead.utmCampaign }),
                            ...(currentLead?.utmContent && { utm_content: currentLead.utmContent }),
                            ...(currentLead?.utmTerm && { utm_term: currentLead.utmTerm })
                        };

                        console.log("Meta Track Data (Booking):", trackData);

                        window.fbq('track', 'CompleteRegistration', {
                            value: 500,
                            currency: 'USD',
                            test_param: 'working',
                            ...trackData
                        });
                    }

                    // Pass the newly scheduled event URI so the backend knows where to find the start and end times
                    await markAsBooked(leadId || currentLead._id, e.data.payload.event.uri);
                    navigate('/'); // Send them to the dashboard/landing page after booking
                } catch (error) {
                    console.error("Failed to mark lead as booked after Calendly event:", error);
                }
            }
        },
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-12 px-4">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 flex items-center text-neutral-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>

            <div className="max-w-3xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Schedule Your Strategy Session
                    </h1>
                    <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                        Pick a time that works for you. We'll show you exactly how our CRM automation can double your conversions.
                    </p>
                </div>

                {/* Mocking Calendly Embed */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

                    {/* Info Sidebar */}
                    <div className="bg-neutral-800/50 p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-neutral-800">
                        <h3 className="font-semibold text-xl mb-6">Demo Call details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center text-neutral-300">
                                <Clock className="w-5 h-5 mr-3 text-blue-500" />
                                <span>30 Minutes</span>
                            </div>
                            <div className="flex items-center text-neutral-300">
                                <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                                <span>Google Meet</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-neutral-700">
                            <p className="text-sm text-neutral-400">
                                "Our booking rate went up by 40% after implementing this automation flow."
                                <br /><br />
                                - Sarah J., SaaS Founder
                            </p>
                        </div>
                    </div>

                    {/* Calendly Integration Area */}
                    <div className="p-8 md:w-2/3 flex flex-col items-center justify-center min-h-[500px] bg-white rounded-r-2xl">
                        <InlineWidget
                            url={`https://calendly.com/suryansh1440/demo-call?name=${encodeURIComponent(currentLead?.name || "")}&email=${encodeURIComponent(currentLead?.email || "")}`}
                            styles={{ height: '100%', width: '100%', minHeight: '600px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
