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
    // --- veo 3.1) ---
veo3:  { hd4: 263,   // 720p  - 4s (0,80$  11 videos)
         hd6: 393,   // 720p  - 6s (1,20$)
         hd8: 523,   // 720p  - 8s (1,60$)
         fhd4: 263,  // 1080p - 4s (0,80$)
         fhd6: 393,  // 1080p - 6s (1,20$)
         fhd8: 523 },  // 1080p - 8s (1,60$) 

  // --- Veo 3.1 fast) ---
veo3_lite: { hd4: 128,  // 720p  - 4s ($0.40) -> 24 vidéos max
         hd6: 191,  // 720p  - 6s ($0.60)
         hd8: 253,  // 720p  - 8s ($0.80)
         fhd4: 128, // 1080p - 4s ($0.40) -> 24 vidéos max
         fhd6: 191, // 1080p - 6s ($0.60)
         fhd8: 253  },  // 1080p - 8s ($0.80) // 

// --- kling 2.6 pro) ---
  kling26: {
    fhd5: 110,
    fhd10: 217
  },

  // --- kling 2.6 motion ---
  kling26_motion: {
    fhd5: 110,
    fhd10: 217
  },
// --- Kling 3.0 ---
  kling30: {
    // HD (720p)
    hd3: 80,
    hd4: 105,
    hd5: 131,
    hd6: 156,
    hd7: 182,
    hd8: 207,
    hd9: 233,
    hd10: 258,
    hd11: 284,
    hd12: 309,
    hd13: 335,
    hd14: 360,
    hd15: 386,

    // FULL HD (1080p)
    fhd3: 108,
    fhd4: 143,
    fhd5: 178,
    fhd6: 213,
    fhd7: 248,
    fhd8: 283,
    fhd9: 318,
    fhd10: 353,
    fhd11: 388,
    fhd12: 423,
    fhd13: 458,
    fhd14: 493,
    fhd15: 528
  },

  // --- HAILUO 2.3 fast ---
  hailuo: {
    hd6: 91,
    hd10: 179,
    fhd6: 160
  },

  // --- MINIMAX H3 ---
  minimax_h3: {
    // HD (768p)
    hd4: 103,
    hd5: 128,
    hd6: 153,
    hd7: 178,
    hd8: 203,
    hd9: 228,
    hd10: 253,
    hd11: 278,
    hd12: 303,
    hd13: 328,
    hd14: 353,
    hd15: 378,

    // 2K / FHD
    fhd4: 163,
    fhd5: 203,
    fhd6: 243,
    fhd7: 283,
    fhd8: 323,
    fhd9: 363,
    fhd10: 403,
    fhd11: 443,
    fhd12: 483,
    fhd13: 523,
    fhd14: 563,
    fhd15: 603
  },

  // --- PIXVERSE V6 ---
  pixverse6: {
    // 360p (SD)
    p360_1: 11,
    p360_2: 19,
    p360_3: 26,
    p360_4: 34,
    p360_5: 42,
    p360_6: 50,
    p360_7: 58,
    p360_8: 65,
    p360_9: 73,
    p360_10: 81,
    p360_11: 89,
    p360_12: 97,
    p360_13: 104,
    p360_14: 112,
    p360_15: 120,

    // 540p (SD+)
    p540_1: 14,
    p540_2: 25,
    p540_3: 35,
    p540_4: 46,
    p540_5: 57,
    p540_6: 68,
    p540_7: 79,
    p540_8: 89,
    p540_9: 100,
    p540_10: 111,
    p540_11: 122,
    p540_12: 133,
    p540_13: 143,
    p540_14: 154,
    p540_15: 165,

    // 720p (HD)
    hd1: 17,
    hd2: 31,
    hd3: 44,
    hd4: 58,
    hd5: 72,
    hd6: 86,
    hd7: 100,
    hd8: 113,
    hd9: 127,
    hd10: 141,
    hd11: 155,
    hd12: 169,
    hd13: 182,
    hd14: 196,
    hd15: 210,

    // 1080p (FULL HD)
    fhd1: 31,
    fhd2: 60,
    fhd3: 88,
    fhd4: 117,
    fhd5: 145,
    fhd6: 173,
    fhd7: 202,
    fhd8: 230,
    fhd9: 259,
    fhd10: 287,
    fhd11: 315,
    fhd12: 344,
    fhd13: 372,
    fhd14: 401,
    fhd15: 429
  },
  // --- SEEDANCE 1.5 ---
  seedance: {
    // SD (480p)
    sd4: 23,
    sd5: 28,
    sd6: 32,
    sd7: 38,
    sd8: 44,
    sd9: 50,
    sd10: 52,
    sd11: 57,
    sd12: 62,

    // HD (720p)
    hd4: 47,
    hd5: 58,
    hd6: 69,
    hd7: 80,
    hd8: 91,
    hd9: 102,
    hd10: 113,
    hd11: 124,
    hd12: 135,

    // FULL HD (1080p)
    fhd4: 103,
    fhd5: 127,
    fhd6: 151,
    fhd7: 176,
    fhd8: 201,
    fhd9: 226,
    fhd10: 251,
    fhd11: 276,
    fhd12: 301
  },

  // --- SEEDANCE 2.0 ---
  seedance20: {
    // SD (480p)
    sd4: 101,
    sd5: 123,
    sd6: 147,
    sd7: 171,
    sd8: 195,
    sd9: 219,
    sd10: 243,
    sd11: 267,
    sd12: 292,
    sd13: 316,
    sd14: 340,
    sd15: 377,

    // HD (720p)
    hd4: 224,
    hd5: 280,
    hd6: 335,
    hd7: 390,
    hd8: 445,
    hd9: 500,
    hd10: 555,
    hd11: 610,
    hd12: 664,
    hd13: 719,
    hd14: 774,
    hd15: 833,

    // FULL HD (1080p)
    fhd4: 555,
    fhd5: 694,
    fhd6: 832,
    fhd7: 970,
    fhd8: 1108,
    fhd9: 1246,
    fhd10: 1385,
    fhd11: 1523,
    fhd12: 1661,
    fhd13: 1799,
    fhd14: 1937,
    fhd15: 2076
  },

  // --- SEEDANCE 2.5 ---
  seedance25: {
    // SD (480p)
    sd4: 136,
    sd5: 169,
    sd6: 202,
    sd7: 236,
    sd8: 269,
    sd9: 302,
    sd10: 336,
    sd11: 369,
    sd12: 402,
    sd13: 435,
    sd14: 469,
    sd15: 502,
    sd16: 535,
    sd17: 568,
    sd18: 602,
    sd19: 635,
    sd20: 668,
    sd21: 701,
    sd22: 735,
    sd23: 768,
    sd24: 801,
    sd25: 834,
    sd26: 868,
    sd27: 901,
    sd28: 934,
    sd29: 967,
    sd30: 1001,

    // HD (720p)
    hd4: 303,
    hd5: 378,
    hd6: 453,
    hd7: 527,
    hd8: 602,
    hd9: 677,
    hd10: 752,
    hd11: 827,
    hd12: 902,
    hd13: 977,
    hd14: 1052,
    hd15: 1127,
    hd16: 1202,
    hd17: 1277,
    hd18: 1352,
    hd19: 1427,
    hd20: 1502,
    hd21: 1577,
    hd22: 1652,
    hd23: 1727,
    hd24: 1802,
    hd25: 1877,
    hd26: 1952,
    hd27: 2027,
    hd28: 2102,
    hd29: 2177,
    hd30: 2251,

    // FULL HD (1080p)
    fhd4: 802,
    fhd5: 1001,
    fhd6: 1201,
    fhd7: 1401,
    fhd8: 1600,
    fhd9: 1800,
    fhd10: 1999,
    fhd11: 2199,
    fhd12: 2399,
    fhd13: 2598,
    fhd14: 2798,
    fhd15: 2998,
    fhd16: 3198,
    fhd17: 3397,
    fhd18: 3597,
    fhd19: 3797,
    fhd20: 3996,
    fhd21: 4196,
    fhd22: 4396,
    fhd23: 4595,
    fhd24: 4795,
    fhd25: 4995,
    fhd26: 5194,
    fhd27: 5394,
    fhd28: 5594,
    fhd29: 5793,
    fhd30: 5992
  },
  // --- Images) ---

// --- GPT Image 2) ---
    gptImage2: 

{  transparentBackground: 11,  // --- Fond transparent (transparent-background)0,0221 $ (~0,020 €)   400 images8 ⚡) ---
  inpaint: 11,               // --- Retouche / Inpaint (inpaint)0,0223 $ (~0,021 €)   380 images8 ⚡) ---
  textToImage: 18,          // --- Texte vers Image (text-to-image)0,0426 $ (~0,039 €)   205 images15 ⚡ ---
  referenceToImage: 26},    // --- Image de référence (reference-to-image)0,0675 $ (~0,062 €)   129 images23 ⚡) ---

  
  // --- flux2pro) benefice 5 euros ---
  flux2pro: {
  mp1: 14,        // --- 1 MP (ex: 1024x1024)0,03 $ (~0,028 €)   285 images 11 ⚡ ---
  mp2: 20,         // --- 2 MP (ex: 1080p / 2K)0,045 $ (~0,041 €)   194 images 16 ⚡ ---
  mp4: 30         // --- 4 MP (ex: 2048x2048 / 4K)0,075 $ (~0,069 €)   115 images 26 ⚡ ---
},

  // --- banana 2 lite) benefice 5 euros ---
nanoBanana2Lite: {
  k1: 15,               // --- Texte vers Image : 12 ⚡ par image ( 257) ---
  reference1k: 15      // --- Image de référence  : 12 ⚡ par image ( 257) ---
},
},

  "12.99": { 
    // --- MODE ÉCLAIRS (Abonnés - Prix coûtant + petite marge) ---
veo3:  { hd4: 260,   // 720p  - 4s (0,80$)
         hd6: 390,   // 720p  - 6s (1,20$)
         hd8: 520,   // 720p  - 8s (1,60$)
         fhd4: 260,  // 1080p - 4s (0,80$)
         fhd6: 390,  // 1080p - 6s (1,20$)
         fhd8: 520 },  // 1080p - 8s (1,60$) 

 veo3_lite: { hd4: 125,  // 720p  - 4s ($0.40) -> 24 vidéos max
         hd6: 188,  // 720p  - 6s ($0.60)
         hd8: 250,  // 720p  - 8s ($0.80)
         fhd4: 125, // 1080p - 4s ($0.40) -> 24 vidéos max
         fhd6: 188, // 1080p - 6s ($0.60)
         fhd8: 250  },  // 1080p - 8s ($0.80) // 

     
// --- Kling 2.6 Pro : tarif abonnement Débutant ---
       kling26:  { fhd5: 110, fhd10: 217 },

// --- Kling 2.6 Motion Control : tarif abonnement Débutant ---
       kling26_motion: { fhd5: 110, fhd10: 217 },

// --- HD (Kling 3.0 Standard - 720p) ---             
        kling30: {
  hd3: 77,
  hd4: 102,
  hd5: 128,
  hd6: 153,
  hd7: 179,
  hd8: 204,
  hd9: 230,
  hd10: 255, // 🎯 Référence 10s (11 vidéos max)
  hd11: 281,
  hd12: 306,
  hd13: 332,
  hd14: 357,
  hd15: 383,

  // --- FULL HD (Kling 3.0 Pro - 1080p) : 35 Éclairs / sec ---
  fhd3: 105,
  fhd4: 140,
  fhd5: 175,
  fhd6: 210,
  fhd7: 245,
  fhd8: 280,
  fhd9: 315,
  fhd10: 350, // 🎯 Référence 10s (8 vidéos max)
  fhd11: 385,
  fhd12: 420,
  fhd13: 455,
  fhd14: 490,
  fhd15: 525},

// TARIFICATION HAILUO 2.3
 hailuo:  { 

  hd6: 88,    // 🎯 34 vidéos max (4,15 € profit)
  hd10: 176,  // 🎯 17 vidéos max (4,15 € profit)

  // --- FULL HD (1080p) ---
  fhd6: 157  }, // 🎯 19 vidéos max (4,44 € profit)
  // 

   "minimax_h3": {
  // --- HD (768p) ---
  hd4: 100,
  hd5: 125,
  hd6: 150,
  hd7: 175,
  hd8: 200,
  hd9: 225,
  hd10: 250, // 🎯 12 vidéos max (~4,11 € profit)
  hd11: 275,
  hd12: 300,
  hd13: 325,
  hd14: 350,
  hd15: 375, // 🎯 8 vidéos max (~4,03 € profit)

  // --- 2K ---
  fhd4: 160,
  fhd5: 200,
  fhd6: 240,
  fhd7: 280,
  fhd8: 320,
  fhd9: 360,
  fhd10: 400, // 🎯 7 vidéos max (~4,52 € profit)
  fhd11: 440,
  fhd12: 480,
  fhd13: 520,
  fhd14: 560,
  fhd15: 600 }, // 🎯 5 vidéos max (~3,94 € profit)
  
// TARIFICATION PIXVERSE V6 (1s à 15s)
   "pixverse6":

   // --- 360p (SD) ---   
   { p360_1: 8,
  p360_2: 16,
  p360_3: 23,
  p360_4: 31,
  p360_5: 39,  // 🎯 77 vidéos max (4,06 € profit)
  p360_6: 47,
  p360_7: 55,
  p360_8: 62,
  p360_9: 70,
  p360_10: 78,
  p360_11: 86,
  p360_12: 94,
  p360_13: 101,
  p360_14: 109,
  p360_15: 117,

  // --- 540p (SD+) ---
  p540_1: 11,
  p540_2: 22,
  p540_3: 32,
  p540_4: 43,
  p540_5: 54,  // 🎯 55 vidéos max (4,08 € profit)
  p540_6: 65,
  p540_7: 76,
  p540_8: 86,
  p540_9: 97,
  p540_10: 108,
  p540_11: 119,
  p540_12: 130,
  p540_13: 140,
  p540_14: 151,
  p540_15: 162,

  // --- 720p (HD) ---
  hd1: 14,
  hd2: 28,
  hd3: 41,
  hd4: 55,
  hd5: 69,   // 🎯 43 vidéos max (4,00 € profit)
  hd6: 83,
  hd7: 97,
  hd8: 110,
  hd9: 124,
  hd10: 138,
  hd11: 152,
  hd12: 166,
  hd13: 179,
  hd14: 193,
  hd15: 207,

  // --- 1080p (FULL HD) ---
  fhd1: 28,
  fhd2: 57,
  fhd3: 85,
  fhd4: 114,
  fhd5: 142,  // 🎯 21 vidéos max (4,21 € profit)
  fhd6: 170,
  fhd7: 199,
  fhd8: 227,
  fhd9: 256,
  fhd10: 284,
  fhd11: 312,
  fhd12: 341,
  fhd13: 369,
  fhd14: 398,
  fhd15: 426},

  // seedance 1.5 sdk fal)
    seedance: { // --- SD (480p) ---
  sd4: 20,
  sd5: 25,  // 🎯 120 vidéos max (7,00 € profit)
  sd6: 29,
  sd7: 35,
  sd8: 41,
  sd9: 47,
  sd10: 49,
  sd11: 54,
  sd12: 59,

  // --- HD (720p) ---
  hd4: 44,
  hd5: 55, // 🎯 5s : 54 vidéos max (7,00 € profit)
  hd6: 66,
  hd7: 77,
  hd8: 88,
  hd9: 99,
  hd10: 110,
  hd11: 121,
  hd12: 132,

  // --- FULL HD (1080p) ---
  fhd4: 100,
  fhd5: 124,  // 🎯 24 vidéos max (7,00 € profit)
  fhd6: 148,
  fhd7: 173,
  fhd8: 198,
  fhd9: 223,
  fhd10: 248,
  fhd11: 273,
  fhd12: 298 },

  // seedance 2.0)
"seedance20": {
  // --- SD (480p) 4s : 30 vidéos 5 euros de chiffre ---
  sd4: 98, sd5: 120, sd6: 144, sd7: 168, sd8: 192, sd9: 216, sd10: 240, sd11: 264, sd12: 289, sd13: 313, sd14: 337, sd15: 374,

  // --- HD (720p) 4s : 13 vidéos 5 euros de chiffre  ---
  hd4: 221, hd5: 277, hd6: 332, hd7: 387, hd8: 442, hd9: 497, hd10: 552, hd11: 607, hd12: 661, hd13: 716, hd14: 771, hd15: 830,

  // --- FULL HD (1080p) 4s : 5 vidéos 5 euros de chiffre  ---
  fhd4: 552, fhd5: 691, fhd6: 829, fhd7: 967, fhd8: 1105, fhd9: 1243, fhd10: 1382, fhd11: 1520, fhd12: 1658, fhd13: 1796, fhd14: 1934, fhd15: 2073
},

seedance25: {
  // --- SD (480p) ---
  sd4: 133,
  sd5: 166,   // ---  5s : 13 vidéos 4.5 euros de chiffre  ---
  sd6: 199,
  sd7: 233,
  sd8: 266,
  sd9: 299,
  sd10: 333,
  sd11: 366,
  sd12: 399,
  sd13: 432,
  sd14: 466,
  sd15: 499,
  sd16: 532,
  sd17: 565,
  sd18: 599,
  sd19: 632,
  sd20: 665,
  sd21: 698,
  sd22: 732,
  sd23: 765,
  sd24: 798,
  sd25: 831,
  sd26: 865,
  sd27: 898,
  sd28: 931,
  sd29: 964,
  sd30: 998,

  // --- HD (720p) ---
  hd4: 300,
  hd5: 375,
  hd6: 450,
  hd7: 524,
  hd8: 599,
  hd9: 674,
  hd10: 749,
  hd11: 824,
  hd12: 899,
  hd13: 974,
  hd14: 1049,
  hd15: 1124,
  hd16: 1199,
  hd17: 1274,
  hd18: 1349,
  hd19: 1424,
  hd20: 1499,
  hd21: 1574,
  hd22: 1649,
  hd23: 1724,
  hd24: 1799,
  hd25: 1874,
  hd26: 1949,
  hd27: 2024,
  hd28: 2099,
  hd29: 2174,
  hd30: 2248,

  // --- FULL HD (1080p) ---
  fhd4: 799,
  fhd5: 998,
  fhd6: 1198,
  fhd7: 1398,
  fhd8: 1597,
  fhd9: 1797,
  fhd10: 1996,
  fhd11: 2196,
  fhd12: 2396,
  fhd13: 2595,
  fhd14: 2795,
  fhd15: 2995,
  fhd16: 3195,
  fhd17: 3394,
  fhd18: 3594,
  fhd19: 3794,
  fhd20: 3993,
  fhd21: 4193,
  fhd22: 4393,
  fhd23: 4592,
  fhd24: 4792,
  fhd25: 4992,
  fhd26: 5191,
  fhd27: 5391,
  fhd28: 5591,
  fhd29: 5790,
  fhd30: 5989

},
  // --- Images) ---

// --- GPT Image 2) ---
    gptImage2: 

{  transparentBackground: 8,  // --- Fond transparent (transparent-background)0,0221 $ (~0,020 €)   400 images8 ⚡) ---
  inpaint: 8,               // --- Retouche / Inpaint (inpaint)0,0223 $ (~0,021 €)   380 images8 ⚡) ---
  textToImage: 15,          // --- Texte vers Image (text-to-image)0,0426 $ (~0,039 €)   205 images15 ⚡ ---
  referenceToImage: 23},    // --- Image de référence (reference-to-image)0,0675 $ (~0,062 €)   129 images23 ⚡) ---

  
  // --- flux2pro) benefice 5 euros ---
  flux2pro: {
  mp1: 11,        // --- 1 MP (ex: 1024x1024)0,03 $ (~0,028 €)   285 images 11 ⚡ ---
  mp2: 17,         // --- 2 MP (ex: 1080p / 2K)0,045 $ (~0,041 €)   194 images 16 ⚡ ---
  mp4: 27          // --- 4 MP (ex: 2048x2048 / 4K)0,075 $ (~0,069 €)   115 images 26 ⚡ ---
},

  // --- banana 2 lite) benefice 5 euros ---
nanoBanana2Lite: {
  k1: 12,               // --- Texte vers Image : 12 ⚡ par image ( 257) ---
  reference1k: 12       // --- Image de référence  : 12 ⚡ par image ( 257) ---
 }
}
};

// --- LIAISON DES PLANS (Éviter les erreurs de saisie) ---
PRICING_DATA["24.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["34.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["59.99"]  = PRICING_DATA["12.99"];
PRICING_DATA["159.99"] = PRICING_DATA["12.99"];


export const ALLOWED_ENGINES = Object.keys(PRICING_DATA["0.00"]);

export { PRICING_DATA, PLAN_TO_PRICE, packs };