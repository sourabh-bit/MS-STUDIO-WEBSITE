// Shared props for every online-masterclass call to action (hero, pricing
// section and the mobile sticky bar), so all three always behave the same.
export type OnlineCtaProps = {
  onOpenCheckout: () => void;
  // Already paid — buttons switch to "You're Enrolled" instead of a price.
  isEnrolled: boolean;
  // A registration/payment check is running after a click.
  isBusy: boolean;
};
