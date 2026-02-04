import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Star, Clock, Calendar, CheckCircle, Loader2 } from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw1UTrUdEFVexDV6prtTEqo8N_c5B_HkvGXIuIiW8Bl4VrddHJC7lvmGKst0A-PU6Bz/exec";

function Form() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            await fetch(SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(formData),
                mode: "no-cors" // Essential for GAS to avoid CORS errors in browser
            });
            // Since no-cors gives opaque response, we assume success if no network error
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error("Error submitting form", error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-green-500/20 rounded-2xl p-8 text-center"
            >
                <div className="flex justify-center mb-4">
                    <CheckCircle className="text-green-500 w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400">Thanks for reaching out. We'll get back to you shortly.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-primary hover:text-white transition-colors"
                >
                    Send another message
                </button>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Your Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-600"
                    placeholder="John Doe"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-600"
                    placeholder="john@example.com"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Phone</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-600"
                    placeholder="+1 234 567 890"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Message</label>
                <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-600"
                    placeholder="How can we help?"
                ></textarea>
            </div>
            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full text-black bg-primary hover:bg-primary/90 font-medium rounded-xl text-lg px-5 py-4 text-center transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Sending...
                    </>
                ) : (
                    'Send Enquiry'
                )}
            </button>
            {status === 'error' && (
                <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
            )}
        </form>
    );
}

function App() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap tracking-tighter">Hey<span className="text-primary italic">Style</span></span>
                    </a>
                    <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                        <button type="button" className="text-black bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/50 font-medium rounded-full text-sm px-6 py-2.5 text-center transition-all">
                            Download App
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointing-events-none -z-10 opacity-50"></div>

                <div className="max-w-screen-xl mx-auto px-4 text-center z-10 relative">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        No Waiting. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Just Styling.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                    >
                        Your all-in-one beauty & grooming app is here. Experience fast, effortless beauty and grooming—no queues, no delays.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <button className="flex items-center justify-center gap-2 text-black bg-white hover:bg-gray-100 font-medium rounded-full text-lg px-8 py-4 transition-all">
                            <Smartphone size={20} />
                            Get the App
                        </button>
                        <button className="flex items-center justify-center gap-2 text-white border border-white/20 hover:bg-white/10 font-medium rounded-full text-lg px-8 py-4 transition-all">
                            Partner with us
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features/Mission Section */}
            <section className="py-24 bg-zinc-950">
                <div className="max-w-screen-xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Stop wasting time waiting.</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                HeyStyle was created with one mission: to end the long wait times in beauty and grooming services. We bring beauty, grooming, and styling directly into your schedule, not the other way around.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    { icon: Clock, text: "Zero waiting time" },
                                    { icon: Calendar, text: "Seamless booking" },
                                    { icon: Star, text: "Premium stylists" }
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-4 text-xl">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <item.icon size={24} />
                                        </div>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            {/* Placeholder for app mockups - using CSS shape for now */}
                            <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl border border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                                <div className="h-full w-full bg-black rounded-2xl flex items-center justify-center border border-white/10">
                                    <span className="text-zinc-700 font-bold text-2xl">App Screenshot</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enquiry Form */}
            <section className="py-24" id="enquiry">
                <div className="max-w-xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Get in touch</h2>
                    <p className="text-gray-400 text-center mb-10">
                        Interested in partnering or have questions? Drop your details below.
                    </p>

                    <Form />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} HeyStyle. All rights reserved.</p>
            </footer>

        </div>
    );
}

export default App;
