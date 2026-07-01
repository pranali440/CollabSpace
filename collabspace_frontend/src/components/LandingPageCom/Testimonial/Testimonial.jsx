import React from "react";
import TestimonialItem from "./TestimonialItem";

const Testimonial = () => {
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-10 md:px-0 px-5">
      <TestimonialItem
        title="Efficient Collaboration"
        text="CollabSpace has completely transformed how our team collaborates. We can brainstorm ideas on the whiteboard, code together, and even meet — all in one platform!"
        name="Ananya Sharma"
        status="Project Team Lead"
      />
      <TestimonialItem
        title="Perfect for Students"
        text="As a student, I love how CollabSpace combines chat, notes, and a shared workspace. It makes group projects and remote discussions much easier to manage."
        name="Rohit Verma"
        status="Computer Engineering Student"
      />
      <TestimonialItem
        title="Great Tool for Educators"
        text="The integrated tools in CollabSpace allow me to teach, guide, and collaborate with students effectively. It’s intuitive, secure, and saves so much time."
        name="Dr. Meera Joshi"
        status="Assistant Professor"
      />
    </div>
  );
};

export default Testimonial;
