export const GOOGLE_ADS_ID = "AW-18339950294";

export const GOOGLE_ADS_LABELS = {
  LEVEL_1_SUBMITTED: "OazLCOjwo-QcENbdlalE",
  SUBSCRIPTION_TAKEN: "mH-nCOqopOQcENbdlalE",
  POPUP_SUBSCRIBED: "TZ2GCISAp-QcENbdlalE",
};

/**
 * Trigger Google Ads conversion tracking event
 */
export const trackGoogleAdsConversion = (
  labelKey: keyof typeof GOOGLE_ADS_LABELS,
  value?: number
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    const label = GOOGLE_ADS_LABELS[labelKey];
    (window as any).gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${label}`,
      value: value || 0,
      currency: "USD",
    });
    console.log(`[Google Ads Tracking] Fired event: ${labelKey} (${label})`);
  } else {
    console.warn("[Google Ads Tracking] gtag is not loaded or window is undefined");
  }
};
