import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getLeads, getStats, markAsBooked, logoutAdmin } from '../services/api';
import { Users, BookOpen, CalendarCheck, Activity, LogOut, CheckCircle, Calendar as CalendarIcon, List } from 'lucide-react';
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
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [leadsRes, statsRes] = await Promise.all([
                    getLeads(),
                    getStats()
                ]);
                setLeads(leadsRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch admin data', error);
                if (error.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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

            <div className="max-w-7xl mx-auto space-y-8">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Leads" value={stats.totalLeads} icon={<Users className="w-6 h-6 text-blue-500" />} />
                    <StatCard title="Downloaded Guide" value={stats.downloadedGuide} icon={<BookOpen className="w-6 h-6 text-emerald-500" />} />
                    <StatCard title="Booked Demo" value={stats.bookedDemo} icon={<CalendarCheck className="w-6 h-6 text-purple-500" />} />
                    <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={<Activity className="w-6 h-6 text-amber-500" />} />
                </div>

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
                                            <tr key={lead._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
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
                                                            onClick={() => manuallyMarkBooked(lead._id)}
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
                                    .map((lead) => ({
                                        title: lead.name,
                                        start: new Date(lead.bookingStartTime),
                                        end: new Date(lead.bookingEndTime),
                                        backgroundColor: '#2563eb', // blue-600
                                        textColor: '#ffffff',
                                    }))}
                                eventClick={(info) => {
                                    alert(`Booking: ${info.event.title}\nTime: ${info.event.start.toLocaleString()} - ${info.event.end.toLocaleString()}`);
                                }}
                            />
                        </div>
                    </div>
                )}

            </div>
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
