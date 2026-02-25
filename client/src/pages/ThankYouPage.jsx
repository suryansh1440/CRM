import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar } from 'lucide-react';

const ThankYouPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white px-4">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold mb-4 tracking-tight">You're All Set!</h1>
                <p className="text-neutral-400 mb-8">
                    The ultimate automation guide has been sent to your email. Check your inbox (and spam folder) in a few minutes.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Want to skip the reading?</h3>
                    <p className="text-sm text-neutral-300 mb-4">
                        See exactly how we can automate your business in a free personalized strategy session.
                    </p>
                    <button
                        onClick={() => navigate('/booking')}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Book Your Free Demo</span>
                    </button>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="text-neutral-500 hover:text-white transition-colors text-sm"
                >
                    Return to homepage
                </button>
            </div>
        </div>
    );
};

export default ThankYouPage;
