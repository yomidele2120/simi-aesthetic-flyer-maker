interface ServiceItem {
  name: string;
  price: string;
}

interface ServiceSectionProps {
  title: string;
  services: ServiceItem[];
  extras?: ServiceItem[];
  extrasTitle?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
}

const ServiceSection = ({ 
  title, 
  services, 
  extras, 
  extrasTitle = "Extra",
  image,
  imageAlt,
  imagePosition = 'right'
}: ServiceSectionProps) => {
  const contentSection = (
    <div className="flex-1 space-y-4">
      <h2 className="flyer-section-title">{title}</h2>
      <div className="ornament-line w-24 mb-6" />
      
      <div className="space-y-1">
        {services.map((service, index) => (
          <div key={index} className="service-item">
            <span className="service-name">{service.name}</span>
            <span className="service-price">₦{service.price}</span>
          </div>
        ))}
      </div>
      
      {extras && extras.length > 0 && (
        <div className="mt-6 pt-4">
          <h3 className="font-elegant text-lg italic text-muted-foreground mb-3">{extrasTitle}</h3>
          <div className="space-y-1">
            {extras.map((extra, index) => (
              <div key={index} className="service-item">
                <span className="service-name">{extra.name}</span>
                <span className="service-price">₦{extra.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const imageSection = image && (
    <div className="flex-1 flex justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-rose rounded-full blur-2xl opacity-20 scale-110" />
        <img 
          src={image} 
          alt={imageAlt || title}
          className="relative w-48 h-48 md:w-56 md:h-56 object-cover rounded-full border-4 border-rose-gold shadow-elegant"
        />
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col md:flex-row gap-8 items-center ${imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
      {contentSection}
      {imageSection}
    </div>
  );
};

export default ServiceSection;
