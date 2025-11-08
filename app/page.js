import Image from "next/image";
// In _app.js or _document.js (Head component)

export default function Home() {
  return (
   <>
 <section className="pt-18 p-8">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome to Our Hostel Management System</h1>
        <p className="text-lg text-gray-700 mb-12 text-center">
          Efficiently manage student accommodations, meal plans, and important information in one seamless platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer border border-transparent hover:bg-blue-50 hover:border-blue-400 transition-all duration-300">
            <Image 
              src="/hostel-room.jpg" alt="Hostel Rooms" 
              width={400} height={250} 
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Room Booking</h2>
              <p className="text-gray-600">Book rooms easily with real-time availability and seamless payment integration.</p>
            </div>
            <div className="absolute inset-0 bg-blue-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300">
              <p className="text-white text-center px-4 text-sm">
                Click here to book your comfortable room instantly!
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer border border-transparent hover:bg-green-50 hover:border-green-400 transition-all duration-300">
            <Image 
              src="/mess-facility.jpg" alt="Mess Facility" 
              width={400} height={250} 
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Mess Facility</h2>
              <p className="text-gray-600">Manage meal plans and monitor mess usage for a hassle-free dining experience.</p>
            </div>
            <div className="absolute inset-0 bg-green-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300">
              <p className="text-white text-center px-4 text-sm">
                View meal plans, subscribe, and customize your dining preferences.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer border border-transparent hover:bg-purple-50 hover:border-purple-400 transition-all duration-300">
            <Image 
              src="/rules-regulations.jpg" alt="Rules and Regulations" 
              width={400} height={250} 
              className="object-cover w-full h-48"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Rules & Regulations</h2>
              <p className="text-gray-600">Stay informed about hostel policies to ensure a safe and respectful environment for all.</p>
            </div>
            <div className="absolute inset-0 bg-purple-600 bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300">
              <p className="text-white text-center px-4 text-sm">
                Read the rules and keep the hostel environment harmonious.
              </p>
            </div>
          </div>
        </div>
      
    </section>
   </>
  );
}
