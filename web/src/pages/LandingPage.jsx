import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                WC
              </div>
              <span className="font-bold text-lg hidden sm:block">Wachemo School</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-600 hover:text-indigo-600 font-medium">Home</a>
              <a href="#about" className="text-gray-600 hover:text-indigo-600 font-medium">About</a>
              <a href="#services" className="text-gray-600 hover:text-indigo-600 font-medium">Services</a>
              <a href="#contact" className="text-gray-600 hover:text-indigo-600 font-medium">Contact</a>
            </div>

            {/* Auth Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
              <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition">Sign Up</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Dropdown) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2">
            <a href="#home" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Home</a>
            <a href="#about" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">About</a>
            <a href="#services" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Services</a>
            <a href="#contact" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Contact</a>
            <hr className="my-2" />
            <Link to="/login" className="block text-gray-600 hover:text-indigo-600 font-medium py-2">Login</Link>
            <Link to="/signup" className="block bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium mt-2">Sign Up</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-indigo-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Modern School Management <br className="hidden md:block" />
            <span className="text-indigo-600">Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Integrated School Community Management System for Wachemo Community Excellency School. Manage students, teachers, grades, attendance, and payments all in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg">Get Started</Link>
            <a href="#about" className="bg-white text-indigo-600 border border-indigo-200 hover:bg-gray-50 px-8 py-3 rounded-lg font-bold text-lg transition">Learn More</a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our School</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/wachemo-school.jpg" alt="School Campus" className="rounded-2xl shadow-xl w-full" />
            </div>
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed text-lg">
                Wachemo Community Excellency School is dedicated to providing quality education to the next generation. Located in Hossana, Ethiopia, we combine traditional values with modern technology.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                Our Integrated School Community Management System (ISCMS) bridges the gap between teachers, parents, and administration, ensuring a transparent and efficient learning environment.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="text-indigo-600 text-xl">✓</span> Real-time attendance tracking
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="text-indigo-600 text-xl">✓</span> Instant grade notifications
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <span className="text-indigo-600 text-xl">✓</span> Secure online payments
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard icon="📊" title="For Administrators" desc="Manage users, classes, and school-wide reports with a powerful dashboard." />
            <ServiceCard icon="👩‍🏫" title="For Teachers" desc="Mark attendance, enter grades, and upload resources effortlessly." />
            <ServiceCard icon="👨‍👩‍👧" title="For Parents" desc="Track your child's progress, receive alerts, and pay fees securely." />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-indigo-600 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">Hossana, Hadiya Zone<br />Ethiopia</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+251 91 XXX XXXX</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="text-4xl mb-4">✉️</div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@wachemoschool.edu.et</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Wachemo Community Excellency School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}