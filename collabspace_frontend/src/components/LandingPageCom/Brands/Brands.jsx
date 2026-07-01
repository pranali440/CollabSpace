import React from "react";
import BrandItem from "./BrandItem";

const Brands = () => {
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-6 gap-y-10 pt-20 px-5 md:px-10">
      <BrandItem
        title="AI Assistant"
        text="Get intelligent help with writing, coding, and brainstorming — integrated right into CollabSpace for real-time collaboration."
        image="/ai-assistant.jpg"
      />
      <BrandItem
        title="Team Collaboration"
        text="Work with your entire team seamlessly — share notes, whiteboards, and projects in one secure place."
        image="/team-collaboration.jpg"
      />
      <BrandItem
        title="Secure Notes"
        text="Store your notes safely with encrypted cloud storage and access them anywhere at any time."
        image="/whiteboard.jpg"
      />
      <BrandItem
        title="Video Meetings"
        text="Connect instantly with HD video meetings built directly into the platform — no external apps needed."
        image="/video-meeting.jpg"
      />
      <BrandItem
        title="Code Editor"
        text="Collaborate in real-time on code projects using our integrated code editor with syntax highlighting."
        image="/code-editor.jpg"
      />
      <BrandItem
        title="Global Access"
        text="Use CollabSpace from anywhere in the world — your workspace is always in the cloud, ready when you are."
        image="/global.jpg"
      />
    </div>
  );
};

export default Brands;
