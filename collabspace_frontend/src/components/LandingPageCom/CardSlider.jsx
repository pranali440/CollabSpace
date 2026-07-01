import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CardSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 800,
    autoplaySpeed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  const slides = [
    {
      title: "Real-Time Collaboration",
      description:
        "Work together seamlessly — share ideas, edit, and brainstorm in real-time with your team on CollabSpace.",
      image: "/team-collaboration.jpg",
    },
    {
      title: "AI Chat Assistant",
      description:
        "Boost your productivity with our built-in AI assistant for quick help, code suggestions, and smart answers.",
      image: "/ai-assistant.jpg",
    },
    {
      title: "Video Conferencing",
      description:
        "Host and join secure video meetings directly from CollabSpace with just one click.",
      image: "/video-meeting.jpg",
    },
    {
      title: "Code Editor",
      description:
        "Collaborate on projects using an integrated code editor with syntax highlighting and version control.",
      image: "/code-editor.jpg",
    },
    {
      title: "Whiteboard & Notes",
      description:
        "Visualize your ideas and collaborate using our interactive whiteboard and shared notepad tools.",
      image: "/whiteboard.jpg",
    },
  ];

  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-semibold">{slide.title}</h3>
              <p className="text-sm mt-2">{slide.description}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CardSlider;
