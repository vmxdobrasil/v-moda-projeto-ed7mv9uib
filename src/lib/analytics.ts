export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // In a real application, this would send data to Google Analytics, Mixpanel, etc.
  console.log(`[Analytics Event] ${eventName}`, properties)
}
