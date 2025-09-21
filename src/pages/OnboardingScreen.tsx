import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const OnboardingScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      emoji: "✍️",
      title: "Drop 1 Thought/Day",
      description: "Share your daily reflections anonymously with the world. Each thought is a window to your soul."
    },
    {
      emoji: "💌",
      title: "Receive Anonymous Replies",
      description: "Get meaningful responses from strangers around the globe. One reply per note, making each connection special."
    },
    {
      emoji: "⏰",
      title: "Disappears in 24 Hours",
      description: "Your thoughts and replies vanish after 24 hours, keeping conversations fresh and authentic."
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/home");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="mobile-container">
      <div className="h-full flex flex-col justify-between p-6">
        {/* Skip Button */}
        <div className="text-right pt-4">
          <button 
            onClick={() => navigate("/home")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center slide-up max-w-xs">
            {/* Emoji */}
            <div className="text-6xl mb-8 bounce-in">
              {slides[currentSlide].emoji}
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {slides[currentSlide].title}
            </h2>
            
            {/* Description */}
            <p className="text-muted-foreground leading-relaxed text-center">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-primary w-6" 
                    : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              onClick={nextSlide}
              className="btn-gradient px-8"
            >
              {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              {currentSlide < slides.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;