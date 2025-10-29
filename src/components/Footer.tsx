import { Instagram, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-primary">Meera Sakhrani</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Where artistry meets elegance.
              Meera transforms every moment into a statement of beauty—crafted with care, shaped by experience, and inspired by you.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="font-body text-sm text-muted-foreground hover:text-primary transition-elegant">
                About Me
              </Link>
              <Link to="/portfolio" className="font-body text-sm text-muted-foreground hover:text-primary transition-elegant">
                Portfolio
              </Link>
              <Link to="/services" className="font-body text-sm text-muted-foreground hover:text-primary transition-elegant">
                Services
              </Link>
              <Link to="/contact" className="font-body text-sm text-muted-foreground hover:text-primary transition-elegant">
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-lg text-foreground">Connect</h4>
            <div className="flex flex-col space-y-3">
              <a href="mailto:hello@elenarose.com" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-elegant">
                <Mail size={16} />
                <span>hello@meeramakeupstudio.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-elegant">
                <Phone size={16} />
                <span>+1 (234) 567-890</span>
              </a>
              <a href="https://www.instagram.com/meerasakhrani?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-elegant">
                <Instagram size={16} />
                <span>@meerasakhrani</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="font-body text-xs text-muted-foreground">
            ©2025 Meera Sakhrani. All rights reserved .  A reflection of beauty and artistry.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;