'use client';

import { useEffect, useRef } from 'react';
import Navbar from '../navbar/page';

export default function About() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    
<Navbar/>
{/* About Us Section */}
<div className="relative h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
    style={{
      backgroundImage: "url('/IMG_2162.JPG')",
    }}
  ></div>
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="w-full h-full flex justify-center items-center">
      <div className="
        max-w-xl mx-auto text-center 
        bg-gradient-to-br from-white/70 via-white/40 to-transparent
        backdrop-blur-md
        p-10 rounded-xl shadow-2xl
      ">
        <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4">
          About Us
        </h1>
        <p className="text-xl text-gray-800 drop-shadow-md">
          Welcome to our hostel management system. We are dedicated to providing a seamless and comfortable experience for students and travelers alike.
        </p>
      </div>
    </div>
  </div>
</div>

{/* Our History Section */}
<div className="relative h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1630696454784-75a2bf33a012?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735')",
    }}
  ></div>
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="w-full h-full flex justify-center items-center">
      <div className="
        max-w-xl mx-auto text-center 
        bg-gradient-to-br from-white/70 via-white/40 to-transparent
        backdrop-blur-md
        p-10 rounded-xl shadow-2xl
      ">
        <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4">
          Our History
        </h1>
        <p className="text-xl text-gray-800 drop-shadow-md">
          From a small student hostel to a digitally managed facility, our journey has been about growth, learning, and putting community first every step of the way.
        </p>
      </div>
    </div>
  </div>
</div>

{/* Vision Section */}
<div className="relative h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
    style={{
      backgroundImage: "url('https://media.istockphoto.com/id/1340302765/photo/success-yellow-arrow-on-black-arrows-background-standing-out-from-the-crowd-lucky-business.jpg?s=2048x2048&w=is&k=20&c=bi2moqAJegAr-a2ughtiCMSAEEtb8Ga_dbwnvacWNG0=')",
    }}
  ></div>
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="w-full h-full flex justify-center items-center">
      <div className="
        max-w-xl mx-auto text-center 
        bg-gradient-to-br from-white/70 via-white/40 to-transparent
        backdrop-blur-md
        p-10 rounded-xl shadow-2xl
      ">
        <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4">
          Vision
        </h1>
        <p className="text-xl text-gray-800 drop-shadow-md">
          To create welcoming hostel spaces where technology bridges gaps, builds connections, and supports every resident's wellbeing.
        </p>
      </div>
    </div>
  </div>
</div>

{/* Mission Section */}
<div className="relative h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
    style={{
      backgroundImage: "url('https://media.istockphoto.com/id/2156917062/photo/travelers-relaxing-with-books-in-hostel-lounge.jpg?s=2048x2048&w=is&k=20&c=apEG2HlMJqC5uhu6V7f1QJdHYQwrUeRdRNAWZeuiBlE=')",
    }}
  ></div>
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="w-full h-full flex justify-center items-center">
      <div className="
        max-w-xl mx-auto text-center 
        bg-gradient-to-br from-white/70 via-white/40 to-transparent
        backdrop-blur-md
        p-10 rounded-xl shadow-2xl
      ">
        <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4">
          Mission
        </h1>
        <p className="text-xl text-gray-800 drop-shadow-md">
          Our mission is to simplify hostel management through innovative solutions and dedicated support, ensuring smooth daily operations for administrators and comfort for residents.
        </p>
      </div>
    </div>
  </div>
</div>

{/* Milestone Section */}
<div className="relative h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-no-repeat bg-cover bg-fixed"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1688789029020-6c5b8b22305a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735')",
    }}
  ></div>
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="w-full h-full flex justify-center items-center">
      <div className="
        max-w-xl mx-auto text-center 
        bg-gradient-to-br from-white/70 via-white/40 to-transparent
        backdrop-blur-md
        p-10 rounded-xl shadow-2xl
      ">
        <h1 className="text-5xl font-extrabold text-gray-900 drop-shadow-lg mb-4">
          Milestone
        </h1>
        <p className="text-xl text-gray-800 drop-shadow-md">
          We’ve proudly served hundreds of students, upgraded our systems with cloud technology, and achieved multiple excellence awards in hostel management industry.
        </p>
      </div>
    </div>
  </div>
</div>



</>
    
  );
}
