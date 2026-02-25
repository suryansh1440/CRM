import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getLeads, getStats, markAsBooked, logoutAdmin } from '../services/api';
import { Users, BookOpen, CalendarCheck, Activity, LogOut, CheckCircle, Calendar as CalendarIcon, List, X, Info, Tag, Clock, Filter, Check } from 'lucide-react';
import { logout } from '../store/authSlice';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const AdminDashboard = () => {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ totalLeads: 0, downloadedGuide: 0, bookedDemo: 0, conversionRate: 0 });
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false); // Used for soft-loading filters
    const [filters, setFilters] = useState({ tag: [], monthlyBudget: [], businessType: [] });
    const [selectedLead, setSelectedLead] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setFetching(true);
            try {
                const [leadsRes, statsRes] = await Promise.all([
                    getLeads(filters),
                    getStats()
                ]);
                setLeads(leadsRes.data);
                // Only set stats on initial load to maintain overall pipeline metrics un-filtered
                if (loading) setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
                if (error.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
                setFetching(false);
            }
        };

        fetchDashboardData();
    }, [filters]);

    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: updated };
        });
    };

    const handleLogout = async () => {
        try {
            await logoutAdmin();
        } catch (error) {
            console.error("Logout failed", error);
        }
        dispatch(logout());
        navigate('/admin');
    };

    const manuallyMarkBooked = async (id) => {
        try {
            const res = await markAsBooked(id);
            if (res.success) {
                // Optimistic UI update
                setLeads(leads.map(lead => lead._id === id ? { ...lead, tag: 'Booked Demo', booked: true } : lead));
                setStats(prev => ({ ...prev, bookedDemo: prev.bookedDemo + 1, conversionRate: (((prev.bookedDemo + 1) / prev.totalLeads) * 100).toFixed(2) }));
            }
        } catch (e) {
            console.error(e);
            alert("Error updating lead.");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">Loading data...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">

            {/* Header */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
                    <p className="text-neutral-400">Manage leads, track conversions, automate growth.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Amazon-Style Filter Sidebar */}
                <div className="w-full md:w-64 space-y-6 flex-shrink-0">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center text-white"><Filter className="w-4 h-4 mr-2 text-blue-500" /> Filters</h2>
                            {(filters.tag.length > 0 || filters.monthlyBudget.length > 0 || filters.businessType.length > 0) && (
                                <button onClick={() => setFilters({ tag: [], monthlyBudget: [], businessType: [] })} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Clear All</button>
                            )}
                        </div>

                        {/* Pipeline Stage */}
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wider">Pipeline Stage</h3>
                            <div className="space-y-3">
                                {['New Lead', 'Downloaded Guide', 'Booked Demo'].map(tag => (
                                    <label key={tag} className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleFilter('tag', tag); }}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors 
                                            ${filters.tag.includes(tag) ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 bg-neutral-950 group-hover:border-neutral-400'}`}>
                                            {filters.tag.includes(tag) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm ${filters.tag.includes(tag) ? 'text-white font-medium' : 'text-neutral-400 group-hover:text-neutral-200'}`}>{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Budget Filter */}
                        <div className="mb-8">
                            <h3 className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wider">Declared Budget</h3>
                            <div className="space-y-3">
                                {['< 10k', '10k - 50k', '50k+'].map(budget => (
                                    <label key={budget} className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleFilter('monthlyBudget', budget); }}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors 
                                            ${filters.monthlyBudget.includes(budget) ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 bg-neutral-950 group-hover:border-neutral-400'}`}>
                                            {filters.monthlyBudget.includes(budget) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm ${filters.monthlyBudget.includes(budget) ? 'text-white font-medium' : 'text-neutral-400 group-hover:text-neutral-200'}`}>{budget}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Business Type */}
                        <div>
                            <h3 className="text-xs font-semibold text-neutral-500 mb-3 uppercase tracking-wider">Business Type</h3>
                            <div className="space-y-3">
                                {['Real Estate', 'Clinic', 'Education', 'Other'].map(type => (
                                    <label key={type} className="flex items-center space-x-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleFilter('businessType', type); }}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors 
                                            ${filters.businessType.includes(type) ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 bg-neutral-950 group-hover:border-neutral-400'}`}>
                                            {filters.businessType.includes(type) && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                        </div>
                                        <span className={`text-sm ${filters.businessType.includes(type) ? 'text-white font-medium' : 'text-neutral-400 group-hover:text-neutral-200'}`}>{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-8 min-w-0">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Total Leads" value={stats.totalLeads} icon={<Users className="w-6 h-6 text-blue-500" />} />
                        <StatCard title="Downloaded Guide" value={stats.downloadedGuide} icon={<BookOpen className="w-6 h-6 text-emerald-500" />} />
                        <StatCard title="Booked Demo" value={stats.bookedDemo} icon={<CalendarCheck className="w-6 h-6 text-purple-500" />} />
                        <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={<Activity className="w-6 h-6 text-amber-500" />} />
                    </div>

                    {fetching && !loading && (
                        <div className="text-sm font-medium text-blue-400 animate-pulse">Updating dashboard data...</div>
                    )}

                    {/* View Toggles */}
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'list' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4 mr-2" /> List View
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'calendar' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                            <CalendarIcon className="w-4 h-4 mr-2" /> Calendar View
                        </button>
                    </div>

                    {viewMode === 'list' && (
                        <>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-6 border-b border-neutral-800">
                                    <h2 className="text-xl font-bold">Recent Leads</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-neutral-400">
                                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-900/50 border-b border-neutral-800">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Contact Name</th>
                                                <th className="px-6 py-4 font-semibold">Budget</th>
                                                <th className="px-6 py-4 font-semibold">Status / Tag</th>
                                                <th className="px-6 py-4 font-semibold">Received</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leads.map((lead) => (
                                                <tr
                                                    key={lead._id}
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{lead.name}</div>
                                                        <div className="text-xs">{lead.email}</div>
                                                        <div className="text-xs text-neutral-500">{lead.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-white">{lead.monthlyBudget}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${lead.tag === 'Booked Demo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                                lead.tag === 'Downloaded Guide' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                            {lead.tag}
                                                        </span>
                                                        {lead.reminderSent && (
                                                            <div className="text-[10px] mt-1 text-emerald-500/70 flex items-center">
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Reminder Sent
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {new Date(lead.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!lead.booked && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // prevent opening the modal when clicking the button
                                                                    manuallyMarkBooked(lead._id);
                                                                }}
                                                                className="bg-neutral-800 hover:bg-neutral-700 text-xs text-white px-3 py-1.5 rounded-md transition-colors"
                                                            >
                                                                Mark Booked
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            {leads.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">
                                                        No leads found. Time to run some ads!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {viewMode === 'calendar' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl p-6">
                            <h2 className="text-xl font-bold mb-6">Demo Bookings</h2>
                            <div className="calendar-container text-neutral-900">
                                <style>{`
                                .fc-theme-standard td, .fc-theme-standard th { border-color: #262626 !important; }
                                .fc .fc-toolbar-title { color: white; font-size: 1.25rem; font-weight: 700; }
                                .fc .fc-button-primary { background-color: #2563eb !important; border-color: #2563eb !important; text-transform: capitalize; font-weight: 500; }
                                .fc .fc-button-primary:hover { background-color: #1d4ed8 !important; }
                                .fc .fc-button-active { background-color: #1e3a8a !important; border-color: #1e3a8a !important; }
                                .fc .fc-daygrid-day-number { color: #d4d4d8; text-decoration: none; font-weight: 500; padding: 8px; }
                                .fc .fc-col-header-cell-cushion { color: #a3a3a3; text-decoration: none; padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em; }
                                .fc-day-today { background-color: rgba(37, 99, 235, 0.05) !important; }
                                .fc-event { border: none !important; border-radius: 6px; font-weight: 500; padding: 4px; margin: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: transform 0.1s; cursor: pointer; color: white !important; }
                                .fc-event:hover { transform: translateY(-1px); filter: brightness(1.1); }
                                .fc-event-main { color: white !important; font-size: 0.875rem; line-height: 1.2; overflow: hidden; }
                                .fc-event-time { font-weight: 700; margin-bottom: 2px; color: rgba(255,255,255,0.9); }
                                .fc-event-title { font-weight: 500; white-space: normal; }
                                .fc-timegrid-slot { height: 3em !important; }
                                .fc-timegrid-now-indicator-line { border-color: #ef4444; border-width: 2px; }
                                .fc-timegrid-now-indicator-arrow { border-color: #ef4444; border-width: 6px 0 6px 6px; }
                            `}</style>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    height="auto"
                                    eventDisplay="block"
                                    displayEventTime={true}
                                    nowIndicator={true}
                                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                    events={leads
                                        .filter(lead => lead.bookingStartTime && lead.bookingEndTime)
                                        .map((lead) => {
                                            const isPast = new Date(lead.bookingStartTime) < new Date();
                                            return {
                                                id: lead._id,
                                                title: lead.name,
                                                start: new Date(lead.bookingStartTime),
                                                end: new Date(lead.bookingEndTime),
                                                backgroundColor: isPast ? '#ef4444' : '#2563eb', // red-500 if past, blue-600 if upcoming
                                                textColor: '#ffffff',
                                                extendedProps: { lead } // Attach full lead data to the event
                                            };
                                        })}
                                    eventClick={(info) => {
                                        setSelectedLead(info.event.extendedProps.lead);
                                    }}
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
                    <div
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-6 flex justify-between items-start z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedLead.name}</h2>
                                <div className="flex items-center space-x-3 text-sm text-neutral-400">
                                    <span>{selectedLead.email}</span>
                                    <span>•</span>
                                    <span>{selectedLead.phone}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-8">

                            {/* Status & Engagement Badge */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                                    <div className="text-xs text-neutral-500 font-medium mb-1 flex items-center"><Tag className="w-3 h-3 mr-1" /> Pipeline Stage</div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold 
                                        ${selectedLead.tag === 'Booked Demo' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                            selectedLead.tag === 'Downloaded Guide' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {selectedLead.tag}
                                    </span>
                                </div>
                                <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                                    <div className="text-xs text-neutral-500 font-medium mb-1">Declared Budget</div>
                                    <div className="text-lg font-bold text-white">{selectedLead.monthlyBudget}</div>
                                </div>
                            </div>

                            <hr className="border-neutral-800" />

                            {/* UTM Parameters Grid */}
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-blue-500" />
                                    Attribution & Tracking
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Source</div>
                                        <div className="text-sm font-medium text-white truncate">{selectedLead.utmSource || 'Direct / Organic'}</div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Campaign</div>
                                        <div className="text-sm font-medium text-white truncate">{selectedLead.utmCampaign || 'N/A'}</div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Medium</div>
                                        <div className="text-sm font-medium text-white truncate">{selectedLead.utmMedium || 'N/A'}</div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Content</div>
                                        <div className="text-sm font-medium text-white truncate">{selectedLead.utmContent || 'N/A'}</div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Term</div>
                                        <div className="text-sm font-medium text-white truncate">{selectedLead.utmTerm || 'N/A'}</div>
                                    </div>
                                    <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                        <div className="text-xs text-neutral-500 mb-1">Click ID (fbclid)</div>
                                        <div className="text-sm font-medium text-neutral-400 truncate" title={selectedLead.fbclid}>{selectedLead.fbclid ? 'Captured' : 'None'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Booking Data (If Applicable) */}
                            {selectedLead.booked && (
                                <>
                                    <hr className="border-neutral-800" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider mb-4 flex items-center">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-purple-500" />
                                            Calendly Event Details
                                        </h3>
                                        <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center text-sm">
                                                <Clock className="w-4 h-4 text-purple-400 mr-3" />
                                                <span className="text-neutral-400 w-24">Start Time:</span>
                                                <span className="text-white font-medium">{new Date(selectedLead.bookingStartTime).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <LogOut className="w-4 h-4 text-neutral-500 mr-3 transform rotate-180" />
                                                <span className="text-neutral-400 w-24">End Time:</span>
                                                <span className="text-white font-medium">{new Date(selectedLead.bookingEndTime).toLocaleString()}</span>
                                            </div>
                                            {selectedLead.eventUri && (
                                                <div className="flex items-center text-sm pt-2 border-t border-purple-500/10">
                                                    <Info className="w-4 h-4 text-blue-400 mr-3" />
                                                    <a href={selectedLead.eventUri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors truncate">
                                                        View Calendly API Source
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* System Metadata */}
                            <hr className="border-neutral-800" />
                            <div className="text-xs text-neutral-600 flex justify-between bg-neutral-950 p-3 rounded-lg">
                                <span><strong>Lead ID:</strong> {selectedLead._id}</span>
                                <span><strong>Created:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</span>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-xl">
            {icon}
        </div>
    </div>
);

export default AdminDashboard;
