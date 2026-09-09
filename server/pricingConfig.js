// pricingConfig.js
// server/serverPricing.js

const PLAN_TO_PRICE = { 
  "debutant": "0.00", 
  "essentiel": "12.99", 
  "standard": "24.99", 
  "master": "34.99", 
  "elite": "59.99", 
  "legende": "159.99" 
};

const packs = ["0.00", "12.99", "24.99", "34.99", "59.99", "159.99"];

const PRICING_DATA = {
  "0.00": { 
    veo3:  { hd4: 55, hd6: 81, hd8: 107, fhd4: 99, fhd6: 147, fhd8: 195},
    veo3_lite: { hd4: 12, hd6: 16, hd8: 21, fhd4: 18, fhd6: 26, fhd8: 33 },
    kling26:  { fhd5: 28, fhd10: 53 },
    kling26_motion:{ fhd5: 28, fhd10: 53, hd5: 18, hd10: 33 },
    kling30: { hd5: 38, fhd5: 48, hd10: 68, fhd10: 88, hd15: 98, fhd15: 128},
    hailuo:  { p512_6: 14, hd6: 18, fhd6: 29, hd10: 29, p512_10: 25 },
    "luma-ray2":  { hd5: 31, p540_5: 18, p540_9: 30, fhd5: 58, hd9: 54, fhd9: 103 },
    "pixverse6": { hd5: 28, fhd5: 42, hd10: 44, fhd10: 73, p540_5: 18, p540_10: 28 },
    seedance: { hd4: 38, sd4: 20, sd12: 49, fhd4: 78, hd12: 103, fhd12: 203 },
    seedance20: { hd5: 173, sd5: 123, sd10: 243, sd15: 363, fhd5: 383, hd10: 343, fhd10: 763, hd15: 513, fhd15: 1143},
    flux:     { pro: 4, dev: 3, schnell: 1 }
  },
  "12.99": { 
    veo3: { hd4: 52, hd6: 78, hd8: 104, fhd4: 96, fhd6: 144, fhd8: 192},
    veo3_lite: { hd4: 9, hd6: 12, hd8: 18, fhd4: 15, fhd6: 23, fhd8: 30 }, 
    kling26:  { fhd5: 25, fhd10: 50 },
    kling26_motion:{ fhd5: 25, fhd10: 50, hd5: 15, hd10: 30 },
    kling30: { hd5: 35, fhd5: 45, hd10: 65, fhd10: 85, hd15: 95, fhd15: 125},
    hailuo:  { p512_6: 11, hd6: 15, fhd6: 26, hd10: 26, p512_10: 22 },
    "luma-ray2": { p540_5: 15, hd5: 20, fhd5: 40, p540_9: 27, hd9: 36, fhd9: 75 },
    "pixverse6": { hd5: 25, fhd5: 39, hd10: 41, fhd10: 70, p540_5: 15, p540_10: 25 },
    seedance: { hd4: 35, sd4: 17, sd12: 46, fhd4: 75, hd12: 100, fhd12: 200 },
    seedance20: { hd5: 170, sd5: 120, sd10: 240, sd15: 360, fhd5: 380, hd10: 340, fhd10: 760, hd15: 510, fhd15: 1140 },
    flux:     { pro: 3, dev: 2, schnell: 1 }
  }
};
PRICING_DATA["24.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["34.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["59.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["159.99"] = PRICING_DATA["12.99"];

const ALLOWED_ENGINES = Object.keys(PRICING_DATA["0.00"]);

module.exports = { PRICING_DATA, PLAN_TO_PRICE, packs, ALLOWED_ENGINES };