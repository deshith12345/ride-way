
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">RideWay</h2>
                    <p className="text-gray-400 text-sm">
                        Sri Lanka&apos;s No.1 Bus Booking Platform.
                        Reliable, Secure, and Comfortable.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-gray-200">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                        <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/routes" className="hover:text-white transition-colors">Routes</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-gray-200">Legal</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-gray-200">Contact</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li>hotline@rideway.lk</li>
                        <li>+94 11 234 5678</li>
                        <li>Colombo, Sri Lanka</li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} RideWay. All rights reserved.
            </div>
        </footer>
    )
}
