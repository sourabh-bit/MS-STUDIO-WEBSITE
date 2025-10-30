import { Link, useLocation } from "react-router-dom";
import { Menu, X, Calendar, Instagram, Facebook, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const leftNavLinks = [
    { name: "HOMEPAGE", path: "/" },
    { name: "MEET MEERA", path: "/about" },
    // { name: "MAKEUP SERVICES", path: "/services" },
  ];

  const rightNavLinks = [
    { name: "PORTFOLIO", path: "/portfolio" },
    { name: "THE JOURNAL", path: "/testimonials" },
    { name: "CONTACT", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-24 lg:h-28">
          {/* Left: Book Button (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/contact">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Book Your Appointment</span>
              </Button>
            </Link>
          </div>

          {/* Left Navigation (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8">
            {leftNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-s uppercase tracking-widest transition-elegant ${
                  isActive(link.path)
                    ? "text-primary font-semibold"
                    : "text-foreground/90 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center: Logo/Brand */}
          <Link to="/" className="flex flex-col items-center transition-elegant hover:opacity-80">
            <span className="font-script text-3xl lg:text-4xl text-primary/70">Meera</span>
            {/* <span className="font-script text-3xl lg:text-4xl text-primary/70">Sakhrani</span> */}
            <div className="font-display text-xl lg:text-2xl tracking-[0.3em] text-primary -mt-2">
              SAKHRANI
            </div>
            {/* <div className="font-display text-xl lg:text-2xl tracking-[0.3em] text-primary -mt-1">
              SAKHRANI
            </div> */}
          </Link>

          {/* Right Navigation (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8">
            {rightNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-s uppercase tracking-widest transition-elegant ${
                  isActive(link.path)
                    ? "text-primary font-semibold"
                    : "text-foreground/90 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Social Icons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-primary transition-elegant">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/meerasakhrani?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-primary transition-elegant">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="mailto:Meerasakhranibeauty@gmail.com" className="text-foreground/50 hover:text-primary transition-elegant">
              <Mail className="w-4 h-4" />
            </a>
            <a href="tel:+91 84482 29694" className="text-foreground/50 hover:text-primary transition-elegant">
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-6 animate-fade-in border-t border-border">
            <div className="flex flex-col space-y-4">
              {[...leftNavLinks, ...rightNavLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-body text-sm uppercase tracking-widest transition-elegant ${
                    isActive(link.path)
                      ? "text-primary font-semibold"
                      : "text-foreground/60 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase">Book Appointment</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;