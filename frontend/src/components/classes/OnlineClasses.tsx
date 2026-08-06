import { MessageCircle, Phone } from "lucide-react";
import Logo from "@/assets/logo.png";
import { MASTERCLASS_DETAILS } from "@/lib/masterclass";

const WHATSAPP_NUMBER = "919818793850";

const OnlineClasses = () => {
  const waitlistMessage = encodeURIComponent(
    `Hi Meera, I'm interested in the ${MASTERCLASS_DETAILS.courseName}. Please let me know when the next batch is announced.`
  );
  const waitlistHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waitlistMessage}`;

  return (
    <section className="flex min-h-[65vh] items-center justify-center bg-warm-cream px-4 py-16 md:py-24">
      <div className="mx-auto max-w-xl text-center">
        <img src={Logo} alt="M Logo" className="mx-auto mb-6 w-14 md:w-16" />

        <span className="mb-4 inline-block font-sans text-xs tracking-[0.4em] text-dusty-rose uppercase md:text-sm">
          The Meera Sakhrani School
        </span>

        <h1 className="mb-4 font-serif text-2xl tracking-wide text-foreground md:text-3xl">
          Online Masterclass
        </h1>

        <div className="my-6 md:my-8">
          <div className="divider-elegant mx-auto w-32" />
        </div>

        <h2 className="mb-4 font-display text-4xl font-light text-primary md:text-5xl">
          Next Batch Announcing Soon
        </h2>

        <p className="text-elegant mx-auto mb-10 max-w-md text-muted-foreground">
          We're putting together something special for the next live online
          masterclass. Reach out and we'll keep you posted the moment
          applications open.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={waitlistHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-primary/10 bg-primary px-8 py-4 font-sans text-sm tracking-[0.2em] text-primary-foreground uppercase shadow-elegant transition-all duration-300 hover:bg-dusty-rose"
          >
            <MessageCircle className="h-4 w-4" />
            Keep Me Posted
          </a>

          <a
            href="tel:+919818793850"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-4 font-sans text-sm tracking-[0.2em] text-foreground uppercase transition-all duration-300 hover:bg-foreground/5"
          >
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default OnlineClasses;
