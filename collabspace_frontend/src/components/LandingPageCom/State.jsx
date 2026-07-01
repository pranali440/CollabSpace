import React from "react";
import CardSlider from "./CardSlider";

const State = () => {
  return (
    <div className="py-28">
      {/* Statistics Summary */}
      <div className="flex justify-between items-center md:px-0 px-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 dark:text-slate-200 font-bold">
            10K+
          </span>
          <span className="text-slate-600 dark:text-slate-300 text-center sm:text-sm text-xs">
            Active Users
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 dark:text-slate-200 font-bold">
            500+
          </span>
          <span className="text-slate-600 dark:text-slate-300 text-center sm:text-sm text-xs">
            Projects Collaborated
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 dark:text-slate-200 font-bold">
            99.9%
          </span>
          <span className="text-slate-600 dark:text-slate-300 text-center sm:text-sm text-xs">
            Server Uptime
          </span>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="mt-10 md:px-0 px-4">
        <h3 className="text-slate-700 dark:text-slate-200 text-2xl font-semibold pb-5 pt-6">
          CollabSpace Performance Metrics
        </h3>

        <div className="flex md:flex-row flex-col md:gap-0 gap-16 justify-between">
          <ul className="list-disc sm:px-5 ps-10 text-slate-700 dark:text-slate-300 flex flex-col gap-5 flex-1 overflow-hidden">
            <li>Trusted by thousands of users across 20+ countries.</li>
            <li>Seamless real-time collaboration for teams and students.</li>
            <li>AI-powered assistant for instant help and automation.</li>
            <li>Integrated video conferencing and task management.</li>
            <li>Enhanced data security with JWT authentication.</li>
            <li>Optimized for both mobile and desktop environments.</li>
            <li>99.9% uptime with cloud-based reliability.</li>
          </ul>

          {/* Optional CardSlider visual component */}
          <div className="flex-1 overflow-hidden">
            <CardSlider />
          </div>
        </div>
      </div>
    </div>
  );
};

export default State;