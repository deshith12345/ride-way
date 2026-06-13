
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
import TravellerSupportChat from "@/components/support/TravellerSupportChat"

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    const faqs = [
        {
            question: "How do I book a bus ticket?",
            answer: "Open Routes, choose the journey you want, select an available trip, pick your seats, and continue to checkout. You must be signed in before a booking can be completed.",
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
        },
        {
            question: "Why do I need an account to book?",
            answer: "Bookings, tickets, payments, and support chats are connected to your account so only you can view or manage them.",
            category: "account"
        },
        {
            question: "Which cards are accepted?",
            answer: "RideWay checkout accepts Visa and Mastercard cards. The card number, expiry date, and security code must pass validation before payment is submitted.",
            category: "payment"
        },
        {
            question: "Where can I find my ticket?",
            answer: "After payment, your tickets appear in your dashboard. Open the ticket dialog to view or download the QR ticket for boarding.",
            category: "booking"
        },
        {
            question: "How does live chat work?",
            answer: "Sign in, start a support conversation from this page or your dashboard, and an admin can reply from the secure support inbox.",
            category: "support"
        }
    ]

    const categories = [
        { icon: HelpCircle, label: "All topics", value: "all" },
        { icon: CreditCard, label: "Payments", value: "payment" },
        { icon: ShieldCheck, label: "Security & Privacy", value: "security" },
        { icon: Clock, label: "Booking & Cancellations", value: "booking" },
        { icon: User, label: "Account Management", value: "account" },
        { icon: MessageCircle, label: "Live Support", value: "support" }
    ]

    const normalizedSearch = searchQuery.trim().toLowerCase()
    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
        const matchesSearch =
            !normalizedSearch ||
            faq.question.toLowerCase().includes(normalizedSearch) ||
            faq.answer.toLowerCase().includes(normalizedSearch)

        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Help Header */}
            <div className="relative overflow-hidden bg-slate-950 py-20 text-white">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(37,99,235,0.85),rgba(14,165,233,0.35),rgba(15,23,42,0.1))]" />
                <div className="absolute inset-0 opacity-10">
                    <HelpCircle className="h-64 w-64 absolute -bottom-20 -right-20" />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">How can we help you?</h1>
                    <p className="mx-auto mb-8 max-w-2xl text-sm font-semibold leading-6 text-blue-100">
                        Search answers, open a secure support chat, or continue a conversation from your traveller dashboard.
                    </p>
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
                            <p className="text-slate-500 text-sm mb-6 font-medium">Temporary phone support number for booking and travel assistance.</p>
                            <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold">+94 11 234 5678</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat</h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">Start or continue a secure support conversation with RideWay admins.</p>
                            <Button
                                variant="outline"
                                className="w-full rounded-xl border-slate-200 font-bold"
                                onClick={() => document.getElementById("live-support")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Chat now
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div id="live-support" className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-xl shadow-slate-200/40">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
                            <MessageCircle className="h-4 w-4" />
                            Live support
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Chat with RideWay support</h2>
                        <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                            Use live chat for booking issues, payment questions, delayed buses, ticket QR problems, and account help.
                            Travellers can also continue this conversation from the dashboard.
                        </p>
                    </div>
                    <TravellerSupportChat />
                </div>

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Categories */}
                    <div className="lg:col-span-1 space-y-2">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            Categories
                        </h2>
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                    selectedCategory === cat.value
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                                        : "text-slate-600 hover:bg-white hover:shadow-md"
                                }`}
                            >
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="lg:col-span-3">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Frequently Asked Questions</h2>
                        <div className="bg-white rounded-3xl p-6 lg:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
                            {filteredFaqs.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    {filteredFaqs.map((faq, idx) => (
                                        <AccordionItem key={`${faq.question}-${idx}`} value={`item-${idx}`} className="border-b border-slate-100 last:border-0 pb-2">
                                            <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-blue-600 group">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-500 font-medium leading-relaxed">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="py-12 text-center">
                                    <HelpCircle className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                                    <h3 className="text-lg font-black text-slate-900">No matching answers</h3>
                                    <p className="mt-2 text-sm font-semibold text-slate-500">Start a live chat and our support team can help directly.</p>
                                </div>
                            )}
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
                            <Button
                                className="md:ml-auto bg-blue-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-blue-200 shrink-0"
                                onClick={() => document.getElementById("live-support")?.scrollIntoView({ behavior: "smooth" })}
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
