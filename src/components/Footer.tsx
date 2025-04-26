
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
              <li><a href="#" className="text-gray-300 hover:text-white">Home Repair</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Lawn Care</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Cleaning</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Plumbing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Electrical</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">GDPR</a></li>
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
