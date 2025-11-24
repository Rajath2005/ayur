import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Users, Mail, FileText, Cookie, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function PrivacyPolicyPage() {
    const [, setLocation] = useLocation();

    const sections = [
        {
            icon: Shield,
            title: 'Our Commitment to Your Privacy',
            content: `At AyuDost AI, we are deeply committed to protecting your privacy and personal information. 
      This Privacy & Cookie Policy explains how we collect, use, store, and protect your data when you use our Ayurvedic AI chatbot platform.`
        },
        {
            icon: Database,
            title: 'What Data We Collect',
            content: `We collect the following types of information:`,
            list: [
                'Account Information: Email address, name, and authentication details (via Firebase Auth)',
                'Chat Messages: Your conversations with the AI for providing Ayurvedic recommendations',
                'Image Uploads: Photos you share for Drishti analysis and visual assessments',
                'Usage Analytics: Session data, page views, and feature usage patterns',
                'Device Information: Browser type, operating system, IP address, and device identifiers',
                'Preferences: Your selected modes, theme preferences, and cookie settings'
            ]
        },
        {
            icon: Users,
            title: 'Why We Collect Data',
            content: `We use your data to:`,
            list: [
                'Provide personalized Ayurvedic health recommendations through our AI',
                'Improve the accuracy and quality of our RAG (Retrieval-Augmented Generation) system',
                'Ensure safety and prevent misuse of the platform',
                'Enhance user experience with better recommendations over time',
                'Maintain and improve our services',
                'Communicate important updates and service information'
            ]
        },
        {
            icon: Lock,
            title: 'Where Data Is Stored',
            content: `Your data is securely stored in:`,
            list: [
                'Firebase: Authentication data and user sessions',
                'MongoDB: Chat conversations, user profiles, and preferences',
                'Secure Cloud Storage: Encrypted image uploads and analysis results',
                'All data is encrypted in transit (HTTPS) and at rest'
            ]
        },
        {
            icon: FileText,
            title: 'Data Retention Policy',
            content: `We retain your data as follows:`,
            list: [
                'Chat Logs: Stored for up to 90 days unless you delete them earlier',
                'Image Uploads: Stored for 30 days or until you delete them',
                'Account Data: Retained while your account is active',
                'Analytics Data: Aggregated and anonymized after 12 months',
                'You can request deletion of your data at any time'
            ]
        },
        {
            icon: AlertCircle,
            title: 'Third-Party Services',
            content: `We use the following third-party services:`,
            list: [
                'Google Gemini API: For AI-powered Ayurvedic recommendations',
                'Firebase: For authentication and user management',
                'MongoDB Atlas: For secure data storage',
                'These services have their own privacy policies and security measures'
            ]
        },
        {
            icon: Users,
            title: 'Your Rights',
            content: `You have the right to:`,
            list: [
                'Access: Request a copy of your personal data',
                'Rectification: Correct inaccurate or incomplete data',
                'Erasure: Request deletion of your data ("right to be forgotten")',
                'Portability: Receive your data in a machine-readable format',
                'Objection: Object to certain types of data processing',
                'Withdraw Consent: Change your cookie preferences at any time'
            ]
        },
        {
            icon: Cookie,
            title: 'Cookie Usage',
            content: `We use cookies for:`,
            list: [
                'Essential Cookies: Required for login, sessions, and core functionality (always enabled)',
                'Analytics Cookies: Track usage patterns to improve our services (optional)',
                'Personalization Cookies: Remember your preferences and settings (optional)',
                'AI Session Logs: Store conversations for improving recommendations (optional)',
                'You can manage your cookie preferences through the cookie settings panel'
            ]
        },
        {
            icon: Mail,
            title: 'Contact Us',
            content: `For privacy-related questions, data requests, or concerns, please contact us at:`,
            list: [
                'Email: privacy@ayudost.ai',
                'We will respond to all requests within 30 days',
                'For urgent security concerns, please mark your email as "URGENT"'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                Privacy & Cookie Policy
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Last updated: November 24, 2025
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="space-y-8">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {section.content}
                                        </p>
                                        {section.list && (
                                            <ul className="space-y-2 ml-6">
                                                {section.list.map((item, i) => (
                                                    <li key={i} className="text-muted-foreground list-disc">
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                {index < sections.length - 1 && (
                                    <div className="border-b border-border mt-8" />
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="mt-12 pt-8 border-t border-border"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            By using AyuDost AI, you agree to this Privacy & Cookie Policy
                        </p>
                        <Button
                            onClick={() => setLocation('/dashboard')}
                            className="w-full sm:w-auto"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
