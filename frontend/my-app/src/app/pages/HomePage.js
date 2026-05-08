'use client';

import { motion} from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {Bell, CheckCircle, Lightbulb, Users, Calendar, Mic, Sparkles, Rocket, ShieldCheck, TrendingUp, Zap, X, Star } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import Link from 'next/link';

const CountUp = ({ end, duration = 5, suffix = "", prefix = "" }) => { // Increased duration to 5 seconds for slower animation
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    // Increased steps for a much slower animation
    const steps = 60; // Increased steps to 60 for a smoother animation
    const increment = end / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      start += increment;
      currentStep++;
      if (currentStep >= steps || start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start)); // Use Math.ceil to ensure it reaches the end value cleanly
      }
    }, (duration * 1000) / steps); // Time per step in milliseconds, adjusted for the longer duration

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <div ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
};


const HomePage = ({ currentTime }) => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000, // Increased duration to 1000ms for slower animations
      once: true,
      easing: 'ease-out-quart'
    });
  }, []);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const testimonials = [
    {
      quote: "This app changed my life! The museum-like interface makes organization feel like an art experience. Truly breathtaking design.",
      author: "Jane Doe, Art Director",
      rating: 5
    },
    {
      quote: "The AI Assistant understands context like a human curator. It anticipates my needs before I articulate them. Revolutionary!",
      author: "Dr. Marcus Chen, AI Researcher",
      rating: 4
    },
    {
      quote: "Using this app feels like walking through a digital gallery. Every interaction is thoughtfully designed and visually stunning.",
      author: "Sophia Laurent, UX Designer",
      rating: 5
    },
    {
      quote: "The museum-inspired aesthetic elevates mundane tasks into delightful experiences. It's functional art for daily life.",
      author: "Thomas Wright, Museum Curator",
      rating: 4
    },
    {
      quote: "The seamless integration between design and functionality is unparalleled. It's like having a personal curator for my life.",
      author: "Michael Johnson, Product Manager",
      rating: 5
    },
    {
      quote: "The attention to detail in the UI makes every interaction a pleasure. It's not just an app, it's an experience.",
      author: "Sarah Kim, Creative Director",
      rating: 3
    },
    {
      quote: "I've tried countless productivity apps, but none blend aesthetics and functionality like this one. Truly revolutionary!",
      author: "David Chen, Software Engineer",
      rating: 5
    },
    {
      quote: "The AI assistant anticipates my needs before I even realize them. It's like having a second brain that understands me perfectly.",
      author: "Emily Rodriguez, Marketing Executive",
      rating: 4
    },
    {
      quote: "The museum-inspired design makes even mundane tasks feel special. It's transformed how I approach my daily routine.",
      author: "James Wilson, Architect",
      rating: 5
    },
    {
      quote: "The level of personalization is incredible. It feels like the app was custom-made just for me and my workflow.",
      author: "Olivia Martin, Journalist",
      rating: 4
    },
    {
      quote: "The elegant transitions and animations make using the app a delight. It's the perfect blend of form and function.",
      author: "Benjamin Lee, UI Designer",
      rating: 5
    },
    {
      quote: "I've never been this organized in my life. The intelligent reminders and scheduling features are game-changers.",
      author: "Sophie Turner, Event Planner",
      rating: 3
    },
    {
      quote: "The data visualization is both beautiful and insightful. It helps me understand my habits and improve my productivity.",
      author: "Daniel Harris, Data Analyst",
      rating: 5
    },
    {
      quote: "The cross-device sync works flawlessly. I can start a task on my phone and finish it on my desktop without missing a beat.",
      author: "Rachel Green, Consultant",
      rating: 4
    },
    {
      quote: "The security features give me peace of mind. I know my personal data is protected like a priceless artifact.",
      author: "Thomas Baker, Financial Advisor",
      rating: 5
    },
    {
      quote: "The voice command integration is incredibly accurate. It feels like I'm conversing with a real assistant.",
      author: "Amanda Scott, Executive Assistant",
      rating: 4
    },
    {
      quote: "The contextual reminders are brilliant. They show up exactly when and where I need them.",
      author: "Kevin Nguyen, Sales Director",
      rating: 5
    },
    {
      quote: "The contact management system is intuitive yet powerful. It's transformed how I maintain professional relationships.",
      author: "Jessica Parker, HR Manager",
      rating: 3
    },
    {
      quote: "The analytics dashboard is a work of art. It turns productivity metrics into beautiful visualizations.",
      author: "Robert Taylor, Business Owner",
      rating: 5
    },
    {
      quote: "This app has fundamentally changed how I approach productivity. It's not just a tool, it's a lifestyle upgrade.",
      author: "Elizabeth Moore, Professor",
      rating: 4
    }
  ];

  const features = [
    { icon: <Sparkles className="w-12 h-12 text-amber-500" />, title: "AI-Powered Insights", description: "Predictive assistance that learns your patterns to anticipate needs before you ask" },
    { icon: <ShieldCheck className="w-12 h-12 text-amber-500" />, title: "Gallery-Grade Security", description: "Military-grade encryption with biometric authentication for your private data" },
    { icon: <Rocket className="w-12 h-12 text-amber-500" />, title: "Lightning Performance", description: "Instant response times powered by optimized neural networks" },
    { icon: <Lightbulb className="w-12 h-12 text-amber-500" />, title: "Curated Experiences", description: "Personalized workflows designed like museum exhibitions" },
    { icon: <Users className="w-12 h-12 text-amber-500" />, title: "Concierge Support", description: "24/7 premium assistance with human-AI collaboration" },
    { icon: <CheckCircle className="w-12 h-12 text-amber-500" />, title: "Omnichannel Sync", description: "Seamless continuity across all your devices and platforms" }
  ];

  const capabilities = [
    { icon: <Users className="w-12 h-12 text-amber-500" />, title: "Intelligent Contacts", description: "Relationship mapping with AI-powered insights and context" },
    { icon: <Calendar className="w-12 h-12 text-amber-500" />, title: "Curated Scheduling", description: "Artful time management that balances priorities and energy" },
    { icon: <Bell className="w-12 h-12 text-amber-500" />, title: "Contextual Reminders", description: "Location-aware notifications with emotional intelligence" },
    { icon: <Mic className="w-12 h-12 text-amber-500" />, title: "Conversational AI", description: "Natural language processing that understands nuance and intent" },
    { icon: <TrendingUp className="w-12 h-12 text-amber-500" />, title: "Life Analytics", description: "Beautiful data visualizations of your personal growth journey" },
    { icon: <Zap className="w-12 h-12 text-amber-500" />, title: "Momentum System", description: "Celebrating progress with artistic achievement displays" }
  ];

  const faqs = [
    {
      question: "How does the AI Assistant help in daily tasks?",
      answer: "Our AI acts as your personal curator, intelligently organizing information while providing anticipatory suggestions based on your behavioral patterns."
    },
    {
      question: "Is my personal data secure?",
      answer: "We employ gallery-grade security protocols with end-to-end encryption and biometric authentication, treating your data like priceless artifacts."
    },
    {
      question: "Can I customize the interface?",
      answer: "Absolutely. Our exhibition-style themes allow you to curate visual experiences ranging from Renaissance elegance to futuristic digital art."
    },
    {
      question: "What makes this different from other assistants?",
      answer: "We blend cutting-edge AI with museum-inspired design philosophy, transforming productivity into an art form through emotionally intelligent interactions."
    },
    {
      question: "How do I get started?",
      answer: "Simply begin your journey by creating an account. Our setup process guides you like a museum tour, personalizing as we learn about you."
    }
  ];

  return (
    <div className="bg-gradient-to-b from-purple-900 via-black to-purple-800 min-h-screen overflow-hidden w-full">
      {/* Hero Section - Full Width */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden w-full">
        <div className="absolute inset-0 z-0">
          {/* Blend from the top gradient (purple-900) to black */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-black/80 to-purple-900/50"></div>
          <img
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop"
            alt="AI Art Gallery"
            className="w-full h-full object-cover opacity-30"
          />
          {/* Blend from black at the bottom of hero to transparent */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent"></div>
        </div>

        {/* Content of Hero Section - remains centered with internal padding */}
        <div className="relative z-10 max-w-7xl px-6 py-24 mx-auto text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }} // Increased transition duration for slower movement
            className="mb-16"
          >
            <div className="inline-block px-4 py-1 mb-6 text-sm text-amber-400 bg-amber-400/10 rounded-full backdrop-blur-sm">
              AI PERSONAL CURATOR
            </div>
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }} // Increased duration and added delay for slower effect
            >
              Your Life, <span className="text-amber-400">Curated</span>.
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }} // Increased duration and delay
            >
              Where artificial intelligence meets museum-grade elegance. Experience personal organization as a form of digital art.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }} // Increased duration and delay
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/login">
                <button
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-full text-lg shadow-lg hover:shadow-xl transform transition duration-500 hover:scale-105" // Increased hover transition duration
                >
                  Begin Your Exhibition
                </button>
              </Link>
              <button className="px-8 py-4 bg-transparent text-white border border-amber-500 font-bold rounded-full text-lg shadow-lg backdrop-blur-sm hover:bg-amber-500/10 transition-colors duration-500"> 
                Gallery Tour
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-20 max-w-4xl mx-auto bg-black/30 backdrop-blur-lg rounded-2xl border border-gray-800 p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }} // Increased duration and delay
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                <Users className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  <CountUp end={89800} suffix="+" />
                </h3>
                <p className="text-gray-400">Active Curators</p>
              </div>
              <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                <CheckCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  <CountUp end={67080} suffix="+" />
                </h3>
                <p className="text-gray-400">Satisfaction Rate</p>
              </div>
              <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-800">
                <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  <CountUp end={38980} suffix="+" />
                </h3>
                <p className="text-gray-400">Customers to AI Assistance</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Digital Gallery Section - Blend from black (from hero's bottom gradient) */}
      <section className="py-24 w-full bg-gradient-to-b from-black to-purple-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000"> 
              The <span className="text-amber-400"> Gallery</span> Experience
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Step into a world where technology and artistry converge to redefine personal productivity
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div data-aos="fade-right" data-aos-duration="1000">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative rounded-2xl overflow-hidden border border-gray-800">
                  {/* AI Assistant Video Demo */}
                  <div className="relative aspect-video w-full">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1635070040809-4a1031c9c71d?q=80&w=2070&auto=format&fit=crop"
                    >
                      <source src="https://framerusercontent.com/assets/65khzBt0drXZt8Dg7XpHhJbP9tk.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" data-aos-delay="200" data-aos-duration="1000">
              <h3 className="text-3xl font-bold text-white mb-6">Designed Like Masterpieces</h3>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Our interface draws inspiration from the world greatest museums, transforming routine tasks into
                gallery-worthy experiences. Every interaction is crafted with the precision of a master artist and
                the intelligence of cutting-edge AI.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-white mb-2">Curated Workflows</h4>
                    <p className="text-gray-400">
                      Like a museum exhibition, your tasks flow in a thoughtfully organized journey
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-white mb-2">Immersive Focus</h4>
                    <p className="text-gray-400">
                      Gallery-inspired environments minimize distractions and maximize presence
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-white mb-2">Artistic Analytics</h4>
                    <p className="text-gray-400">
                      Your productivity data visualized as beautiful information art
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Permanent Collection - Blend from purple-900/20 */}
      <section className="py-24 w-full bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000">
              The <span className="text-amber-400">Permanent</span> Collection
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Our core features - timeless innovations designed with museum-grade craftsmanship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-b from-gray-900/50 to-gray-900 p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100} // Increased delay increments for staggered slower reveal
                data-aos-duration="1000"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4 }} // Increased hover duration
              >
                <div className="mb-6 p-4 bg-amber-500/10 rounded-full">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: AI Personal Assistant Image Div Block - Blends from black */}
      <section className="relative py-24 w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-purple-900/40">
        <div className="absolute inset-0 z-0">
          {/* Overlay to ensure text visibility and blend */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-purple-900/50 to-black/70"></div>
          {/* Bottom blend to transition to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h2
            className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            Your <span className="text-amber-400">AI Personal Assistant</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
            data-aos-duration="1000"
          >
            Chappie is more than just an app . it is a dedicated AI partner, learning, adapting, and empowering your every move with precision and care.
          </motion.p>
          <Link href="/login">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-full text-lg shadow-lg hover:shadow-xl transform transition duration-500 hover:scale-105" // Increased transition duration
              data-aos="fade-up"
              data-aos-delay="400"
              data-aos-duration="1000"
            >
              Meet Chappie
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Capabilities Section - Darker purple fade from previous section's end */}
      <section className="py-24 w-full bg-gradient-to-b from-purple-900/40 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000">
              <span className="text-amber-400">Curatorial</span> Capabilities
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Advanced tools that transform daily organization into an art form
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-b from-gray-900/50 to-gray-900 p-8 rounded-2xl border border-gray-800 flex flex-col items-center text-center backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                data-aos-duration="1000"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6 p-4 bg-amber-500/10 rounded-full">
                  {capability.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">{capability.title}</h4>
                <p className="text-gray-400">{capability.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Patron Reviews - Blend from black */}
      <section className="py-24 w-full bg-gradient-to-b from-black to-purple-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000">
              Patron <span className="text-amber-400">Testimonials</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Hear from those who have experienced our gallery of productivity
            </p>
          </div>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{
              clickable: true,
              el: '.custom-pagination',
              bulletClass: 'swiper-pagination-bullet bg-amber-500',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-amber-400'
            }}
            autoplay={{ delay: 8000, disableOnInteraction: false }} // Increased autoplay delay for slower sliding
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
            className="pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div
                  className="bg-gradient-to-b from-gray-900/50 to-gray-900 p-8 rounded-2xl border border-gray-800 h-full backdrop-blur-sm min-h-[300px]"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  data-aos-duration="1000"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-black font-bold mr-4">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{testimonial.author.split(',')[0]}</h4>
                      <p className="text-amber-500">{testimonial.author.split(',')[1]}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg italic">{testimonial.quote}</p>
                  <div className="flex mt-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-500 fill-current" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={i + testimonial.rating} className="w-5 h-5 text-gray-600" />
                    ))}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom pagination container moved down */}
          <div className="custom-pagination flex justify-center mt-8 space-x-2 !bottom-0"></div>
        </div>
      </section>

      {/* FAQ Section - Curator's Notes - Blend from purple-900/30 */}
      <section className="py-24 w-full bg-gradient-to-b from-purple-900/30 to-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000">
              Curators <span className="text-amber-400">Notes</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Answers to common questions about our gallery of productivity
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-gray-900/50 to-gray-900 rounded-xl border border-gray-800 overflow-hidden backdrop-blur-sm"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                data-aos-duration="1000"
              >
                <button
                  className={`flex justify-between items-center w-full p-6 text-left ${activeAccordion === index ? 'bg-gray-800/50' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <h3 className="text-xl font-bold text-white">{faq.question}</h3>
                  <div className="ml-4 flex-shrink-0">
                    {activeAccordion === index ? (
                      <X className="w-6 h-6 text-amber-500" />
                    ) : (
                      <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    )}
                  </div>
                </button>
                {activeAccordion === index && (
                  <motion.div
                    className="p-6 pt-0 text-gray-300"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }} // Increased accordion transition duration
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Private Viewing - Blend from black */}
      <section className="py-24 w-full bg-gradient-to-b from-black to-purple-900/80">
        <div className="max-w-6xl mx-auto text-center px-6">
          <div className="relative bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-3xl p-1 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-aos="fade-up" data-aos-duration="1000">
                Reserve Your <span className="text-amber-400">Private Viewing</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
                Experience the future of personal productivity in our exclusive gallery
              </p>
              <Link href="/login">
                <button
                  className="px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-full text-xl shadow-lg hover:shadow-xl transform transition duration-500 hover:scale-105" // Increased transition duration
                >
                  Begin Your Exhibition
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Your custom Footer component will blend seamlessly here if it has a matching gradient from purple-900/80 */}
    </div>
  );
};

export default HomePage;