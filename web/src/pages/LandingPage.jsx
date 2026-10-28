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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm">
                <img 
                  src="/wachemo-school.jpg" 
                  alt="Wachemo School" 
                  className="w-full h-full object-cover"
                />
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
            <span className="text-indigo-600">Made Simple and Responsive</span>
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
      <section id="about" className="py-20 bg-slate-50 relative overflow-hidden">
        {/* የጀርባ ማስጌጫ */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Our Story</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              About Wachemo Community Excellency School
            </h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* የግራ በኩል - ምስል እና ስታቲስቲክስ */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src="/wachemo-school.jpg" 
                  alt="Wachemo School Campus" 
                  className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-90">Located in</p>
                  <p className="text-lg font-bold">Wachemo University Campus</p>
                </div>
              </div>

              {/* ተንሳፋፊ የስታቲስቲክስ ካርድ */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-3xl">
                  🎓
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">500+</p>
                  <p className="text-sm text-slate-500 font-medium">Students Enrolled</p>
                </div>
              </div>
            </div>

            {/* የቀኝ በኩል - ጽሑፍ እና መረጃዎች */}
            <div className="space-y-6 mt-12 lg:mt-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-1">
                  📍
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Our Location</h3>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    Located in the Hadiya Zone, Central Ethiopia (Anbicho city area), within the Wachemo University campus—situated to the east of the university and west of the teachers' dormitory.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
                  🌱
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Our History & Growth</h3>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    Founded in 2016 E.C., the school began by providing early childhood education (KG) for the children of university faculty and staff. Over time, we have grown and expanded to include Primary education, welcoming the local community.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-1">
                  🏫
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Our Operations</h3>
                  <p className="text-slate-600 leading-relaxed mt-1">
                    Operating on the second floor of the main university building, we currently host approximately 500 students. To manage student enrollments, daily operations, and service fees efficiently, we rely on modern digital solutions.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-indigo-600 rounded-2xl shadow-lg text-white">
                <h3 className="text-xl font-bold mb-2">Why the ISCMS?</h3>
                <p className="text-indigo-100 leading-relaxed">
                  The Integrated School Community Management System (ISCMS) was developed to bring our administrative processes into the digital age—ensuring efficiency, transparency, and better communication between the school, teachers, parents, and students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 👇 አዲሱ የ Services Section (የጎደለው ክፍል) */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">What We Offer</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-4">Our Services</h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard 
              icon="📊" 
              title="For Administrators" 
              desc="Manage users, classes, and school-wide reports with a powerful dashboard." 
            />
            <ServiceCard 
              icon="👩‍🏫" 
              title="For Teachers" 
              desc="Mark attendance, enter grades, and upload resources effortlessly." 
            />
            <ServiceCard 
              icon="👨‍👩‍👧" 
              title="For Parents" 
              desc="Track your child's progress, receive alerts, and pay fees securely." 
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Get in Touch</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 mb-4">Contact Us</h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="text-5xl mb-4">📍</div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">Address</h3>
              <p className="text-slate-600">Hossana, Hadiya Zone<br />Ethiopia</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">Phone</h3>
              <p className="text-slate-600">+251 91 XXX XXXX</p>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="text-5xl mb-4">✉️</div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">Email</h3>
              <p className="text-slate-600">info@wachemoschool.edu.et</p>
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

// 👇 የ ServiceCard ኮምፖኔንት (አሁን ጥቅም ላይ ውሏል)
function ServiceCard({ icon, title, desc }) {
  return (
    <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center border border-slate-100">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}