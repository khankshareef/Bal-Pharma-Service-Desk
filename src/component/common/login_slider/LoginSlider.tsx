import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Group from "../../../assets/login_images/Group.png";
import slider1 from "../../../assets/login_images/slider1.png";
import slider2 from "../../../assets/login_images/slider2.png";

const slides = [Group, slider1, slider2];
const LoginSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
      style={{ 
        background: "linear-gradient(135deg, #003D8C, #00224f)" 
      }}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.05, x: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center p-12"
        >
          <img
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="max-w-[85%] max-h-[85%] object-contain drop-shadow-2xl"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 flex gap-3 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "bg-white w-8" : "bg-white/40 w-2.5 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginSlider;