import FlyerHeader from "@/components/FlyerHeader";
import ServiceSection from "@/components/ServiceSection";
import ContactFooter from "@/components/ContactFooter";

import lashesImage from "@/assets/lashes-1.jpg";
import browsImage from "@/assets/brows-1.jpg";
import tattoo1Image from "@/assets/tattoo-1.jpg";
import tattoo2Image from "@/assets/tattoo-2.jpg";

const Index = () => {
  const lashServices = [
    { name: "Classic Set", price: "13,000" },
    { name: "Hybrid", price: "17,000" },
    { name: "Volume", price: "22,000" },
    { name: "Mega Volume", price: "25,000" },
  ];

  const lashExtras = [
    { name: "Wispy Effect", price: "5,000" },
    { name: "Under Eyes", price: "5,000" },
    { name: "Lash Removal", price: "5,000" },
    { name: "Refilling", price: "50% of initial set" },
  ];

  const browServices = [
    { name: "Micro Blading", price: "50,000" },
    { name: "Ombré Brows", price: "40,000" },
    { name: "Combination Brows", price: "50,000" },
    { name: "Micro Shading", price: "60,000" },
  ];

  const browExtras = [
    { name: "Brow Lamination", price: "14,000" },
  ];

  const tattooServices = [
    { name: "Small Design", price: "20,000" },
    { name: "Big Design", price: "30,000" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FlyerHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Lashes Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <ServiceSection
            title="Lashes"
            services={lashServices}
            extras={lashExtras}
            image={lashesImage}
            imageAlt="Beautiful lash extensions"
            imagePosition="right"
          />
        </section>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4">
          <div className="ornament-line flex-1" />
          <span className="text-rose-gold text-2xl">✦</span>
          <div className="ornament-line flex-1" />
        </div>

        {/* Brows Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <ServiceSection
            title="Brows"
            services={browServices}
            extras={browExtras}
            image={browsImage}
            imageAlt="Perfect brow artistry"
            imagePosition="left"
          />
        </section>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4">
          <div className="ornament-line flex-1" />
          <span className="text-rose-gold text-2xl">✦</span>
          <div className="ornament-line flex-1" />
        </div>

        {/* Semi Permanent Tattoo Section */}
        <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="text-center mb-8">
            <h2 className="flyer-section-title">Semi-Permanent Tattoo</h2>
            <div className="ornament-line w-32 mx-auto mt-4" />
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Services */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="space-y-3">
                {tattooServices.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">₦{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tattoo Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <img 
                  src={tattoo1Image} 
                  alt="Semi-permanent tattoo design"
                  className="w-full h-40 object-cover rounded-xl border-2 border-rose-gold shadow-elegant"
                />
              </div>
              <div className="relative group">
                <img 
                  src={tattoo2Image} 
                  alt="Butterfly tattoo design"
                  className="w-full h-40 object-cover rounded-xl border-2 border-rose-gold shadow-elegant"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <ContactFooter />
    </div>
  );
};

export default Index;
