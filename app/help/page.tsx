
"use client"

import { useState } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Search,
    Mail,
    Phone,
    MessageCircle,
    CreditCard,
    ShieldCheck,
    Clock,
    User,
    HelpCircle
} from "lucide-react"

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const faqs = [
        {
            question: "How do I book a bus ticket?",
            answer: "Booking a ticket is easy! Simply enter your origin, destination, and travel date on the home page. Browse available buses, select your preferred seat, and proceed to checkout using your credit or debit card.",
            category: "booking"
        },
        {
            question: "Can I cancel my booking?",
            answer: "Yes, you can cancel eligible upcoming bookings from your dashboard. If you need help with a payment issue, contact support with your booking reference.",
            category: "payment"
        },
        {
            question: "How do I track my bus location?",
            answer: "Go to the 'Track Bus' page in the navigation menu and enter your bus registration number or booking reference to see its real-time GPS location on the map.",
            category: "tracking"
        },
        {
            question: "What should I do if my bus is delayed?",
            answer: "We strive for punctuality, but delays can happen due to traffic or weather. Use the live tracking feature to stay updated. If a significant delay occurs, our customer support will notify you via SMS.",
            category: "travel"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Help Header */}
            <div className="bg-blue-600 py-20 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <HelpCircle className="h-64 w-64 absolute -bottom-20 -right-20" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">How can we help you?</h1>
                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Cards */}
                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                <Mail className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Email Support</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Get in touch via email. We usually respond within 24 hours.</p>
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold">support@rideway.lk</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                                <Phone className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Hotline</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Available 24/7 for urgent booking and travel assistance.</p>
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold">+94 11 234 5678</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Quick answers for simple questions about routes and seats.</p>
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold">Chat Now</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Categories */}
                    <div className="lg:col-span-1 space-y-2">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Categories
                        </h2>
                        {[
                            { icon: CreditCard, label: "Payments" },
                            { icon: ShieldCheck, label: "Security & Privacy" },
                            { icon: Clock, label: "Booking & Cancellations" },
                            { icon: User, label: "Account Management" }
                        ].map((cat) => (
                            <button key={cat.label} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-600 font-bold text-sm">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Frequently Asked Questions</h2>
                        <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {faqs.map((faq, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-slate-100 last:border-0 pb-2">
                                        <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-blue-600 group">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-slate-500 font-medium leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 p-8 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-blue-200/50 shrink-0">
                                <HelpCircle className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1 text-lg">Still have questions?</h3>
                                <p className="text-slate-600 font-medium text-sm">If you can't find the answer you're looking for, please contact our support team. We're here to help you 24/7.</p>
                            </div>
                            <Button className="md:ml-auto bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-200 shrink-0">
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
