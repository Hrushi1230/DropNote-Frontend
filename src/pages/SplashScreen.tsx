import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/register");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mobile-container flex items-center justify-center">
      <div className="text-center fade-in">
        <div className="mb-8 bounce-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center shadow-medium">
            <span className="text-3xl">💧</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gradient mb-4">
          DropNote
        </h1>
        
        <p className="text-muted-foreground text-lg font-light">
          Anonymous daily thoughts
        </p>
        
        <div className="mt-12">
          <div className="w-8 h-8 mx-auto">
            <div className="w-full h-full border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;