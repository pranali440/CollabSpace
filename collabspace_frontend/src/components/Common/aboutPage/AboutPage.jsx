import React, { useEffect } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const AboutPage = () => {
  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* About Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20" data-aos="fade-up">
          <div className="lg:w-1/2">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              About <span className="text-customRed">CollabSpace</span>
            </h1>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Welcome to CollabSpace, a next-generation cloud-based collaboration platform
              designed for teams, students, and professionals. CollabSpace brings together
              multiple tools like an AI chatbot, code editor, whiteboard, shared notepad,
              project manager, and video conferencing — all in one unified workspace.
            </p>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Our mission is to make collaboration simple, intelligent, and accessible.
              With real-time synchronization and secure data sharing, CollabSpace empowers
              users to brainstorm, plan, and build together from anywhere.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Integrated code editor for team programming",
                "Secure authentication and data encryption",
                "Video conferencing and task tracking tools",
                "Built-in AI assistant for quick answers and code help",
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="bg-customRed text-white p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors"
                title="Visit us on Facebook"
              >
                <FaFacebookF size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors"
                title="Follow us on Twitter"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors"
                title="Connect on LinkedIn"
              >
                <FaLinkedinIn size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-full p-3 bg-customRed hover:bg-red-700 transition-colors"
                title="Check our Instagram"
              >
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Vision Section */}
          <div className="lg:w-1/2 mt-10 lg:mt-0" data-aos="fade-left">
            <div className="bg-gradient-to-r from-customRed to-red-600 rounded-2xl p-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full">
                <img
                  src="/about.jpg"
                  alt="CollabSpace Vision"
                  className="rounded-xl w-full h-auto object-cover shadow-lg"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Our Vision</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Our vision is to create a single, seamless environment that connects
                    people and ideas — breaking the barriers of distance and device dependency.
                    CollabSpace is built to redefine collaboration for the digital era.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Meet Our Team</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The passionate people behind CollabSpace who work tirelessly to bring you the best experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-aos="fade-up">
          {[
            { name: "Pranali Pathare", role: "Team Lead", image: "/team1.jpg" },
            { name: "Netra Nagpure", role: "Frontend Developer", image: "/team2.jpg" },
            { name: "Pallavi Shinde", role: "Backend Developer", image: "/team3.jpg" },
            { name: "Sakshi Waghmare", role: "UI/UX Designer", image: "/team4.jpg" },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                <p className="text-customRed mt-1">{member.role}</p>
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm">
                Student of PDEA's College of engineering ,Hadpsar.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Our Impact Section */}
        <div className="mt-20 text-center" data-aos="fade-up">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-4xl font-bold text-customRed">10K+</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Active Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-customRed">500+</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Projects Collaborated</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-customRed">20+</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Countries Reached</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-customRed">99.9%</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Data Uptime</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
