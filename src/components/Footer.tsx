
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-white font-bold text-2xl flex items-center">
              Done<span className="text-donezo-teal">zo</span>
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              Connecting you with trusted local service providers in your community.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/services#home-repair" className="text-gray-300 hover:text-white">Home Repair</Link></li>
              <li><Link to="/services#lawn-care" className="text-gray-300 hover:text-white">Lawn Care</Link></li>
              <li><Link to="/services#cleaning" className="text-gray-300 hover:text-white">Cleaning</Link></li>
              <li><Link to="/services#plumbing" className="text-gray-300 hover:text-white">Plumbing</Link></li>
              <li><Link to="/services#electrical" className="text-gray-300 hover:text-white">Electrical</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/how-it-works" className="text-gray-300 hover:text-white">How It Works</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-300 hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} Donezo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
