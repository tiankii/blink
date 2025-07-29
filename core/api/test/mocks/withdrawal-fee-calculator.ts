export const onchainFeeSettingsMock: OnchainFeesConfig = {
  decay: {
    fast: {
      minRate: 0.0075,
      maxRate: 0.04,
      divisor: 30000,
      targetRate: 0.005,
    },
    medium: {
      minRate: 0.005,
      maxRate: 0.03,
      divisor: 20000,
      targetRate: 0.0025,
    },
    slow: {
      minRate: 0.003125,
      maxRate: 0.02,
      divisor: 12500,
      targetRate: 0.001,
    },
  },
  decayConstants: {
    threshold: 4000000,
    minSats: 21000,
    exponentialFactor: 21,
    networkFeeRange: { min: 1, max: 2000 },
  },
  thresholds: {
    regular: [
      { max: 1, count: 0 },
      { max: 500000, count: 1 },
      { max: 3000000, count: 2 },
      { max: 10000000, count: 3 },
      { max: 22000000, count: 4 },
      { max: 70000000, count: 5 },
    ],
    batch: [
      { max: 500000, count: 3 },
      { max: 3000000, count: 4 },
      { max: 10000000, count: 5 },
      { max: 22000000, count: 6 },
      { max: 70000000, count: 7 },
    ],
    defaults: { regular: 6, batch: 8 },
  },
  transaction: {
    baseSize: 11,
    inputSize: 68,
    outputSize: 31,
    outputs: { regular: 2, batch: 11 },
  },
  multiplier: {
    offsets: { fast: 1.3, medium: 1.1, slow: 1.1 },
    factors: { fast: 2, medium: 1, slow: 2 },
  },
}

export const TRANSACTION_SIZE_MATRIX: number[][] = [
  // inputs:  1    2    3    4    5    6    7    8    9   10   11   12
  /* 1 out */ [110, 178, 246, 314, 382, 450, 518, 586, 654, 722, 790, 858],
  /* 2 out */ [141, 209, 277, 345, 413, 481, 549, 617, 685, 753, 821, 889],
  /* 3 out */ [172, 240, 308, 376, 444, 512, 580, 648, 716, 784, 852, 920],
  /* 4 out */ [203, 271, 339, 407, 475, 543, 611, 679, 747, 815, 883, 951],
  /* 5 out */ [234, 302, 370, 438, 506, 574, 642, 710, 778, 846, 914, 982],
  /* 6 out */ [265, 333, 401, 469, 537, 605, 673, 741, 809, 877, 945, 1013],
  /* 7 out */ [296, 364, 432, 500, 568, 636, 704, 772, 840, 908, 976, 1044],
  /* 8 out */ [327, 395, 463, 531, 599, 667, 735, 803, 871, 939, 1007, 1075],
  /* 9 out */ [358, 426, 494, 562, 630, 698, 766, 834, 902, 970, 1038, 1106],
  /* 10 out*/ [389, 457, 525, 593, 661, 729, 797, 865, 933, 1001, 1069, 1137],
  /* 11 out*/ [420, 488, 556, 624, 692, 760, 828, 896, 964, 1032, 1100, 1168],
  /* 12 out*/ [451, 519, 587, 655, 723, 791, 859, 927, 995, 1063, 1131, 1199],
]
