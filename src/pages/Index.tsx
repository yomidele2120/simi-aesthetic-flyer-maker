import lashesImage from "@/assets/lashes-1.jpg";
import browsImage from "@/assets/brows-1.jpg";
import tattoo1Image from "@/assets/tattoo-1.jpg";
import tattoo2Image from "@/assets/tattoo-2.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-pink-50 font-body">
      {/* Header Section with Image */}
      <section className="relative">
        <div className="flex">
          {/* Left Content */}
          <div className="w-2/3 px-8 py-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-pink-900 leading-tight">
              Simi<br />
              <span className="italic text-pink-600">Aesthetic</span>
            </h1>
            <p className="text-pink-700 mt-2 text-sm">Beauty & Confidence</p>
          </div>
          
          {/* Right Pink Block with Image */}
          <div className="w-1/3 relative">
            <div className="absolute inset-0 bg-pink-300"></div>
            <img 
              src={lashesImage} 
              alt="Lash extensions"
              className="relative w-full h-48 object-cover"
            />
          </div>
        </div>
        
        {/* Decorative leaf */}
        <div className="absolute left-6 top-32 text-pink-400 text-4xl opacity-60">🌸</div>
      </section>

      {/* Lash Services Section */}
      <section className="px-8 py-6">
        <div className="bg-pink-100/60 rounded-lg p-5">
          <h2 className="font-display text-xl text-pink-900 font-semibold mb-3">Lash Extension</h2>
          <div className="space-y-1 text-sm text-pink-800">
            <div className="flex justify-between"><span>Classic set</span><span className="font-medium">₦13,000</span></div>
            <div className="flex justify-between"><span>Hybrid</span><span className="font-medium">₦17,000</span></div>
            <div className="flex justify-between"><span>Volume</span><span className="font-medium">₦22,000</span></div>
            <div className="flex justify-between"><span>Mega volume</span><span className="font-medium">₦25,000</span></div>
          </div>
          
          <p className="text-xs text-pink-600 mt-3 font-medium uppercase tracking-wide">Extras</p>
          <div className="space-y-1 text-sm text-pink-700 mt-1">
            <div className="flex justify-between"><span>Wispy effect</span><span>₦5,000</span></div>
            <div className="flex justify-between"><span>Under eyes</span><span>₦5,000</span></div>
            <div className="flex justify-between"><span>Lash removal</span><span>₦5,000</span></div>
            <div className="flex justify-between"><span>Refilling</span><span>50% of set price</span></div>
          </div>
        </div>
      </section>

      {/* Image with Newsletter Style */}
      <section className="flex">
        <div className="w-1/2 relative">
          <img 
            src={browsImage} 
            alt="Brow artistry"
            className="w-full h-52 object-cover"
          />
        </div>
        <div className="w-1/2 bg-pink-200 flex flex-col justify-center px-6 py-4">
          <p className="text-pink-500 text-xs uppercase tracking-widest">Services</p>
          <h3 className="font-display text-2xl text-pink-900 font-bold mt-1">Perfect Brows</h3>
          <p className="text-pink-700 text-sm mt-2 leading-relaxed">
            Expertly crafted brows that enhance your natural beauty.
          </p>
        </div>
      </section>

      {/* Brows Services Section */}
      <section className="px-8 py-6">
        <div className="space-y-1 text-sm text-pink-800">
          <div className="flex justify-between"><span>Micro blading</span><span className="font-medium">₦50,000</span></div>
          <div className="flex justify-between"><span>Ombré brows</span><span className="font-medium">₦40,000</span></div>
          <div className="flex justify-between"><span>Combination brows</span><span className="font-medium">₦50,000</span></div>
          <div className="flex justify-between"><span>Micro shading</span><span className="font-medium">₦60,000</span></div>
        </div>
        
        <p className="text-xs text-pink-600 mt-4 font-medium uppercase tracking-wide">Extras</p>
        <div className="space-y-1 text-sm text-pink-700 mt-1">
          <div className="flex justify-between"><span>Brows lamination</span><span>₦14,000</span></div>
        </div>
      </section>

      {/* Something Special Section Title */}
      <section className="py-6 text-center">
        <h2 className="font-display text-xl text-pink-900 uppercase tracking-[0.2em]">Semi Permanent Tattoo</h2>
      </section>

      {/* Gallery Row */}
      <section className="flex gap-2 px-4">
        <div className="flex-1">
          <img 
            src={tattoo1Image} 
            alt="Blessed tattoo"
            className="w-full h-36 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <img 
            src={tattoo2Image} 
            alt="Butterfly tattoo"
            className="w-full h-36 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 bg-pink-300 rounded-lg flex items-center justify-center">
          <div className="text-center text-pink-900 text-sm p-3">
            <div className="font-medium">Small design</div>
            <div>₦20,000</div>
            <div className="mt-2 font-medium">Big design</div>
            <div>₦30,000</div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="text-center py-8 px-8">
        <h3 className="font-display text-xl text-pink-900 uppercase tracking-widest">Let Yourself Be Beautiful</h3>
        <p className="text-pink-600 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
          Experience the art of aesthetic beauty with our professional services. Your confidence is our priority.
        </p>
      </section>

      {/* Contact Footer */}
      <footer className="bg-pink-400 text-white py-6 px-8">
        <div className="text-center space-y-2 text-sm">
          <p className="font-medium">📍 15 Ekoro Road, Abule Egba</p>
          <p>📞 09152581489</p>
          <p>💬 WhatsApp: 09152581489</p>
        </div>
        
        <div className="flex justify-center gap-6 mt-4 text-white/90 text-sm">
          <span>📸 Simi_aesthetic_123</span>
          <span>🎵 Simi_aesthetic_</span>
        </div>
        
        <div className="flex justify-center gap-4 mt-4">
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">f</span>
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">✕</span>
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">📷</span>
        </div>
        
        <p className="text-center text-xs mt-4 text-white/70 uppercase tracking-wide">Follow Us</p>
      </footer>
    </div>
  );
};

export default Index;
