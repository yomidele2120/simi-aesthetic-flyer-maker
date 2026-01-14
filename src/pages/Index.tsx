import { Instagram } from "lucide-react";
import lashesImage from "@/assets/lashes-1.jpg";
import browsImage from "@/assets/brows-1.jpg";
import tattoo1Image from "@/assets/tattoo-1.jpg";
import tattoo2Image from "@/assets/tattoo-2.jpg";

// TikTok icon component (not available in lucide-react)
const TikTokIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-pink-100 font-body flex items-center justify-center py-6 px-4">
      {/* A4-ish container with decorative border */}
      <div className="w-full max-w-[240mm] bg-pink-50 shadow-2xl border-[6px] border-pink-400 outline outline-2 outline-pink-200 outline-offset-4 relative">
        {/* Corner decorations */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-pink-600 rounded-tl-sm"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-pink-600 rounded-tr-sm"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-pink-600 rounded-bl-sm"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-pink-600 rounded-br-sm"></div>
        {/* Header Section with Image */}
        <section className="relative">
          <div className="flex">
            {/* Left Content */}
            <div className="w-2/3 px-6 py-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-pink-900 leading-tight">
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
                className="relative w-full h-40 object-cover"
              />
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute left-5 top-28 text-pink-400 text-3xl opacity-60">🌸</div>
        </section>

        {/* Lash Services Section */}
        <section className="px-6 py-5">
          <div className="bg-pink-100/60 rounded-lg p-4">
            <h2 className="font-display text-lg text-pink-900 font-semibold mb-2">Lash Extension</h2>
            <div className="space-y-1 text-sm text-pink-800">
              <div className="flex justify-between"><span>Classic set</span><span className="font-medium">₦13,000</span></div>
              <div className="flex justify-between"><span>Hybrid</span><span className="font-medium">₦17,000</span></div>
              <div className="flex justify-between"><span>Volume</span><span className="font-medium">₦22,000</span></div>
              <div className="flex justify-between"><span>Mega volume</span><span className="font-medium">₦25,000</span></div>
            </div>
            
            <p className="text-xs text-pink-600 mt-2 font-medium uppercase tracking-wide">Extras</p>
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
              className="w-full h-44 object-cover"
            />
          </div>
          <div className="w-1/2 bg-pink-200 flex flex-col justify-center px-5 py-3">
            <p className="text-pink-500 text-xs uppercase tracking-widest">Services</p>
            <h3 className="font-display text-xl text-pink-900 font-bold mt-1">Perfect Brows</h3>
            <p className="text-pink-700 text-sm mt-2 leading-relaxed">
              Expertly crafted brows that enhance your natural beauty.
            </p>
          </div>
        </section>

        {/* Brows Services Section */}
        <section className="px-6 py-5">
          <div className="space-y-1 text-sm text-pink-800">
            <div className="flex justify-between"><span>Micro blading</span><span className="font-medium">₦50,000</span></div>
            <div className="flex justify-between"><span>Ombré brows</span><span className="font-medium">₦40,000</span></div>
            <div className="flex justify-between"><span>Combination brows</span><span className="font-medium">₦50,000</span></div>
            <div className="flex justify-between"><span>Micro shading</span><span className="font-medium">₦60,000</span></div>
          </div>
          
          <p className="text-xs text-pink-600 mt-3 font-medium uppercase tracking-wide">Extras</p>
          <div className="space-y-1 text-sm text-pink-700 mt-1">
            <div className="flex justify-between"><span>Brows lamination</span><span>₦14,000</span></div>
          </div>
        </section>

        {/* Semi Permanent Tattoo Title */}
        <section className="py-4 text-center">
          <h2 className="font-display text-lg text-pink-900 uppercase tracking-[0.2em]">Semi Permanent Tattoo</h2>
        </section>

        {/* Gallery Row */}
        <section className="flex gap-2 px-4">
          <div className="flex-1">
            <img 
              src={tattoo1Image} 
              alt="Blessed tattoo"
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <img 
              src={tattoo2Image} 
              alt="Butterfly tattoo"
              className="w-full h-28 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 bg-pink-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-pink-900 text-sm p-2">
              <div className="font-medium">Small design</div>
              <div>₦20,000</div>
              <div className="mt-1 font-medium">Big design</div>
              <div>₦30,000</div>
            </div>
          </div>
        </section>

        {/* Tagline Section */}
        <section className="text-center py-6 px-6">
          <h3 className="font-display text-lg text-pink-900 uppercase tracking-widest">Let Yourself Be Beautiful</h3>
          <p className="text-pink-600 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
            Experience the art of aesthetic beauty with our professional services.
          </p>
        </section>

        {/* Contact Footer */}
        <footer className="bg-pink-200 text-pink-900 py-5 px-6">
          <div className="text-center space-y-1.5 text-sm font-medium">
            <p>📍 15 Ekoro Road, Abule Egba</p>
            <p>📞 09152581489</p>
            <p>💬 WhatsApp: 09152581489</p>
          </div>
          
          <div className="flex justify-center gap-5 mt-3 text-pink-800 text-sm">
            <span className="flex items-center gap-1">
              <Instagram size={16} />
              Simi_aesthetic_123
            </span>
            <span className="flex items-center gap-1">
              <TikTokIcon size={16} />
              Simi_aesthetic_
            </span>
          </div>
          
          <div className="flex justify-center gap-3 mt-3">
            <span className="w-7 h-7 rounded-full bg-pink-400 text-white flex items-center justify-center text-sm">f</span>
            <span className="w-7 h-7 rounded-full bg-pink-400 text-white flex items-center justify-center text-sm">✕</span>
            <span className="w-7 h-7 rounded-full bg-pink-400 text-white flex items-center justify-center">
              <Instagram size={14} />
            </span>
          </div>
          
          <p className="text-center text-xs mt-3 text-pink-700 uppercase tracking-wide font-semibold">Follow Us</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
