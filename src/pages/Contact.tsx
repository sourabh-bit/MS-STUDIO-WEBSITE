import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Instagram, MapPin } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the form data to a backend
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. I'll get back to you within 24 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      date: "",
      message: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
            Let's Connect
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to begin your beauty journey? Reach out to book a consultation or ask any questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="animate-fade-up">
            <h2 className="font-display text-3xl text-primary mb-8">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-body text-sm text-foreground/70 mb-2">
                  Your Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-card border-border focus:border-primary transition-elegant"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-body text-sm text-foreground/70 mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-card border-border focus:border-primary transition-elegant"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block font-body text-sm text-foreground/70 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-card border-border focus:border-primary transition-elegant"
                />
              </div>

              <div>
                <label htmlFor="service" className="block font-body text-sm text-foreground/70 mb-2">
                  Service Interested In
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:border-primary transition-elegant font-body"
                >
                  <option value="">Select a service</option>
                  <option value="bridal">Bridal Makeup</option>
                  <option value="editorial">Editorial & Fashion</option>
                  <option value="events">Special Events</option>
                  <option value="lessons">Makeup Lessons</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block font-body text-sm text-foreground/70 mb-2">
                  Preferred Date
                </label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-card border-border focus:border-primary transition-elegant"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-body text-sm text-foreground/70 mb-2">
                  Your Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="bg-card border-border focus:border-primary transition-elegant resize-none"
                  placeholder="Tell me about your vision, event details, or any questions you have..."
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-elegant"
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 animate-fade-up lg:pl-8">
            <div>
              <h2 className="font-display text-3xl text-primary mb-8">
                Get in Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-1">Email</p>
                    <a href="mailto:hello@elenarose.com" className="font-body text-foreground hover:text-primary transition-elegant">
                      hello@elenarose.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-1">Phone</p>
                    <a href="tel:+1234567890" className="font-body text-foreground hover:text-primary transition-elegant">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Instagram className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-1">Instagram</p>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-body text-foreground hover:text-primary transition-elegant">
                      @elenarosemakeup
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-body text-foreground">
                      Los Angeles, CA<br />
                      Available for travel
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-peach/20 to-accent/20 p-8 rounded-3xl">
              <h3 className="font-display text-2xl text-primary mb-4">
                Business Hours
              </h3>
              <div className="space-y-2 font-body text-foreground/80">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>By Appointment</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-3xl shadow-soft">
              <h3 className="font-display text-2xl text-primary mb-4">
                Quick Response
              </h3>
              <p className="font-body text-sm text-foreground/70 leading-relaxed">
                I typically respond to all inquiries within 24 hours. For urgent bookings 
                or same-week appointments, please call directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
