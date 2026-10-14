import { Instagram, Mail, FileText, Lock } from "lucide-react";
import { Link } from "react-router-dom";

import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { WHATSAPP_NUMBERS, whatsappUrl } from "@/lib/contact";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border pt-10 pb-4 mt-auto">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* GRID */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-8">
          
          {/* Brand */}
          <div className="col-span-2 space-y-3 md:col-span-1">
            <h3 className="font-display text-2xl text-primary">Meera Sakhrani</h3>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              Where artistry meets elegance—delivering refined, timeless, and graceful beauty experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-lg text-foreground">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition">
                About Me
              </Link>
              <Link to="/portfolio" className="text-sm text-muted-foreground hover:text-primary transition">
                Portfolio
              </Link>
              <Link to="/Testimonials" className="text-sm text-muted-foreground hover:text-primary transition">
                Journal
              </Link>
              <Link to="/classes" className="text-sm text-muted-foreground hover:text-primary transition">
                Makeup School
              </Link>
            </div>
          </div>

          {/* Consumer Policy */}
          <div className="space-y-3">
            <h4 className="font-display text-lg text-foreground">Consumer Policy</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/terms-and-conditions" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <FileText size={16} className="shrink-0" /> Terms & Conditions
              </Link>
              <Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <Lock size={16} className="shrink-0" /> Privacy Policy
              </Link>
              <Link to="/refund-and-cancellation-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <Lock size={16} className="shrink-0" /> Refund & Cancellation Policy
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="col-span-2 min-w-0 space-y-3 md:col-span-1">
            <h4 className="font-display text-lg text-foreground">Connect</h4>
            <div className="flex flex-col space-y-2">
              <a href="mailto:hello@meeramakeupstudio.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <Mail size={16} className="shrink-0" /> <span className="min-w-0 break-all">hello@meeramakeupstudio.com</span>
              </a>
              <a href={whatsappUrl(WHATSAPP_NUMBERS.booking)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <WhatsAppIcon className="h-4 w-4 shrink-0" /> WhatsApp · Bookings
              </a>
              <a href={whatsappUrl(WHATSAPP_NUMBERS.school)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <WhatsAppIcon className="h-4 w-4 shrink-0" /> WhatsApp · MS Art School
              </a>
              <a 
                href="https://www.instagram.com/meerasakhrani"
                target="_blank"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
              >
                <Instagram size={16} className="shrink-0" /> @meerasakhrani
              </a>
            </div>
          </div>

        </div>

        {/* FOOTER BOTTOM */}
        <div className="border-t border-border/40 mt-8 pt-4">
          <p className="text-center text-xs text-foreground/60">
            ©2025 Meera Sakhrani. All rights reserved.
          </p>

          <div className="flex justify-center items-center gap-1 mt-1">
            <span className="text-[11px] text-foreground/50">
              Crafted with care by
            </span>

            <a
              href="https://www.instagram.com/sourabhroy3446?igsh=YzczeWlqbXVhMHd4"
              target="_blank"
              className="flex items-center gap-1 text-primary/70 hover:text-primary transition"
            >
              <span className="text-[11px] text-foreground/50 font-medium">Sourabh Roy</span>
            </a>
            <a href ="https://www.instagram.com/sourabhroy3446?igsh=YzczeWlqbXVhMHd4" target="_blank" rel="noopener noreferrer" className="text-foreground/50 hover:text-primary transition-elegant">
              <Instagram className="w-4 h-4" />
            </a> 
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
