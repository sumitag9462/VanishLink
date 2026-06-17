const { z } = require('zod');

const createLinkSchema = z.object({
  url: z.string().url().optional().or(z.literal('')),
  targetUrl: z.string().url().optional().or(z.literal('')),
  slug: z.string().max(255).optional(),
  title: z.string().max(255).optional(),
  password: z.string().min(4).optional().nullable(),
  isOneTime: z.boolean().optional(),
  maxClicks: z.number().min(0).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  showPreview: z.boolean().optional(),
  collection: z.string().max(100).optional(),
  scheduleStart: z.string().datetime().optional().nullable(),
  creatorName: z.string().max(100).optional(),
  ownerEmail: z.string().email().optional().nullable(),
  
  // Array types
  destinations: z.array(z.object({
    url: z.string().url(),
    weight: z.number().min(0).optional()
  })).optional(),
  routingMode: z.enum(['single', 'weighted', 'random', 'round-robin', 'sequential']).optional(),
  fallbackUrl: z.string().url().optional().nullable(),
  
  visibility: z.enum(['public', 'private']).optional(),
  geoFenceEnabled: z.boolean().optional(),
  allowedCountries: z.union([z.string(), z.array(z.string())]).optional(),
  blockedCountries: z.union([z.string(), z.array(z.string())]).optional(),
  
  otpEnabled: z.boolean().optional(),
  otpAllowedEmails: z.union([z.string(), z.array(z.string())]).optional(),
  
  // Advanced Objects
  conditionalRedirect: z.object({
    enabled: z.boolean().optional(),
    deviceRules: z.object({
      mobileUrl: z.string().url().nullable().optional(),
      desktopUrl: z.string().url().nullable().optional(),
      tabletUrl: z.string().url().nullable().optional(),
      botUrl: z.string().url().nullable().optional(),
    }).optional(),
    timeOfDayRules: z.array(z.object({
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(0).max(23),
      url: z.string().url(),
    })).optional(),
    dayTypeRules: z.object({
      weekdayUrl: z.string().url().nullable().optional(),
      weekendUrl: z.string().url().nullable().optional(),
    }).optional(),
    clickRules: z.array(z.object({
      minClicks: z.number().min(0),
      maxClicks: z.number().nullable().optional(),
      url: z.string().url()
    })).optional()
  }).optional(),
  
  webhookConfig: z.object({
    enabled: z.boolean().optional(),
    url: z.string().url().nullable().optional(),
    secret: z.string().nullable().optional(),
    triggers: z.object({
      onFirstClick: z.boolean().optional(),
      onExpiry: z.boolean().optional(),
      onOneTimeComplete: z.boolean().optional(),
    }).optional()
  }).optional(),
  
  ghostMode: z.object({
    enabled: z.boolean().optional(),
    secretToken: z.string().nullable().optional(),
    decoyUrl: z.string().url().nullable().optional().or(z.literal('')),
    aiDecoy: z.boolean().optional(),
    failedAttempts: z.number().optional(),
    destroyAfterAttempts: z.number().nullable().optional(),
    adaptiveDetection: z.boolean().optional(),
    geoRestrictions: z.array(z.string()).optional(),
    deviceRestrictions: z.array(z.string()).optional(),
    timeRestrictions: z.any().optional(), // Could be more specific if needed
    analyticsEnabled: z.boolean().optional(),
    honeypotMode: z.boolean().optional()
  }).optional()
}).refine(data => {
  return data.url || data.targetUrl || (data.destinations && data.destinations.length > 0);
}, {
  message: "destination url is required",
  path: ["url"]
});

module.exports = {
  createLinkSchema
};
