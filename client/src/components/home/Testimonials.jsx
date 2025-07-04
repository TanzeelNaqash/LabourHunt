import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Emily Watson",
    role: "Homeowner",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60",
    comment: "Finding qualified workers for my home renovation was so easy with LabourHunt. The verification system gave me confidence in hiring, and the carpenter I found did exceptional work!",
    rating: 5,
  },
  {
    id: 2,
    name: "Robert Chen",
    role: "Masonry Specialist",
    image: "https://images.unsplash.com/photo-1633493702341-4d04841df53b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60",
    comment: "Since joining LabourHunt, my business has grown tremendously. The verification process helps clients trust my services, and the platform makes it easy to showcase my portfolio of work.",
    rating: 4.5,
  },
];

export default function Testimonials() {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-accent text-accent" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-5 w-5 text-accent/30" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="h-5 w-5 fill-accent text-accent" />
          </div>
        </div>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-accent/30" />);
    }
    
    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">What Our Users Say</h2>
        <p className="text-neutral-700 text-center mb-12 max-w-2xl mx-auto">
          Hear from clients and workers who have found success on our platform.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-[#F3F2EF] rounded-xl p-6">
              <div className="flex items-start mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-neutral-700 italic mb-4">{testimonial.comment}</p>
              <div className="flex text-accent">
                {renderStars(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
