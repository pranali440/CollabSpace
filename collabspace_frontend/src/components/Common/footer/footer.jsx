import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-headerColor py-6 lg:py-2 min-h-28 z-50 relative">
      <div className="xl:px-10 sm:px-6 px-4 min-h-28 flex lg:flex-row flex-col lg:gap-0 gap-5 justify-between items-center">
        {/* Navigation Links */}
        <ul className="flex flex-1 md:gap-6 gap-4 text-white flex-row items-center">
          <li>
            <Link to="/contact" className="hover:underline">Contact Us</Link>
          </li>
          <li>
            <Link to="/" className="hover:underline">Services</Link>
          </li>
          <li>
            <Link to="/" className="hover:underline">Feedback</Link>
          </li>
          <li>
            <Link to="/" className="hover:underline">Privacy Policy</Link>
          </li>
        </ul>

        {/* Copyright */}
        <p className="w-fit flex items-center text-white text-sm">
          &copy; {currentYear} Collabspace | All rights reserved.
        </p>

        {/* Social Media Icons */}
        <div className="flex-1 flex flex-row gap-6 lg:justify-end justify-start items-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white border h-10 w-10 flex justify-center items-center border-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-300"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white border h-10 w-10 flex justify-center items-center border-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-300"
          >
            <FaLinkedinIn />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white border h-10 w-10 flex justify-center items-center border-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-300"
          >
            <FaTwitter />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white border h-10 w-10 flex justify-center items-center border-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-300"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
