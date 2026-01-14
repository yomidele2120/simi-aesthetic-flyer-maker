import { MapPin, Phone, MessageCircle } from "lucide-react";

const ContactFooter = () => {
  return (
    <footer className="bg-gradient-rose text-primary-foreground py-10 px-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h3 className="font-display text-2xl font-semibold">Book Your Appointment</h3>
        <div className="ornament-line w-32 mx-auto opacity-50" />
        
        <div className="space-y-4 font-body text-sm md:text-base">
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>15 Ekoro Road, Abule Egba, Lagos</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            <span>09152581489</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp: 09152581489</span>
          </div>
        </div>

        <div className="pt-4 border-t border-primary-foreground/20">
          <p className="font-elegant text-lg italic mb-3">Follow Us</p>
          <div className="flex flex-col items-center gap-2 font-body text-sm">
            <span>📸 Instagram: @Simi_aesthetic_123</span>
            <span>🎵 TikTok: @Simi_aesthetic_</span>
          </div>
        </div>

        <div className="pt-6">
          <p className="font-elegant text-base italic opacity-80">
            "Where Beauty Meets Artistry"
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;
