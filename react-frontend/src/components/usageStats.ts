
interface OSUsageObj {
    t: number,
    [version: string]: number
}

interface UsageStats {
    sourceName: string,
    sourceURL: string,
    asOf: string,
    android: OSUsageObj,
    ios: OSUsageObj,
    mac: OSUsageObj,
    windows: OSUsageObj,
    linux?: OSUsageObj,
    chromeos?: OSUsageObj
}
export const usageStats: UsageStats = {
    sourceName: "StatCounter",
    sourceURL: "https://gs.statcounter.com/os-market-share",
    asOf: "2020-11-30",
    android: {
        t: 0.3883,
        '11.0': 0,
        '10.0': 0.4035,
        '9.0': 0.2259,
        '8.0': 0.1552, // actually sum of 8.1 and 8.0
        '7.0': 0.0826, // 7.0 + 7.1
        '6.0': 0.0656,
        '5.0': 0.0483, // 5.0 + 5.1
        '4.4': 0.0144,
        '4.3': 0.001,
        '4.2': 0.0018,
        '4.1': 0.0011
    },
    ios: {
        t: 0.1657,
        '14': 0.6153,
        '13': 0.2363, // sum of all sub-versions
        '12': 0.0944,
        '11': 0.0163,
        '10': 0.0159,
        '9': 0.0149,
        '8': 0.0017,
        '7': 0.0022
    },
    mac: {
        t: 0.0731,
        '11.0': 0,
        '10.15': 0.674,
        '10.14': 0.1274,
        '10.13': 0.0945,
        '10.12': 0.038,
        '10.11': 0.0308,
        '10.10': 0.0233,
        '10.9': 0.0063,
        '10.8': 0.0017,
        '10.7': 0.0016,
        '10.6': 0.0021
    },
    windows: {
        t: 0.3237,
        '10': 0.7596,
        '7': 0.1768,
        '8.1': 0.0398,
        '8': 0.0109,
        'XP': 0.0079,
        'Vista': 0.0046
    },
    linux: {
        t: 0.0081
    },
    chromeos: {
        t: 0.0085,
        '87': 1
    }
}

/* May 2020
sourceName: "StatCounter",
    sourceURL: "https://gs.statcounter.com/os-market-share",
    asOf: "2020-05-01",
    android: {
        t: 0.3781,
        '10.0': 0.1869,
        '9.0': 0.3466,
        '8.0': 0.1877, // actually sum of 8.1 and 8.0
        '7.0': 0.1061, // 7.0 + 7.1
        '6.0': 0.0874,
        '5.0': 0.0615, // 5.0 + 5.1
        '4.4': 0.0183,
        '4.3': 0.0013,
        '4.2': 0.0023,
        '4.1': 0.0013
    },
    ios: {
        t: 0.1528,
        '13': 0.7814, // sum of all sub-versions
        '12': 0.1422,
        '11': 0.0264,
        '10': 0.0221,
        '9': 0.019,
        '8': 0.0024,
        '7': 0.003
    },
    mac: {
        t: 0.0854,
        '10.15': 0.5093,
        '10.14': 0.2028,
        '10.13': 0.136,
        '10.12': 0.0565,
        '10.11': 0.0449,
        '10.10': 0.0321,
        '10.9': 0.0088,
        '10.8': 0.0033,
        '10.7': 0.0026,
        '10.6': 0.0034
    },
    windows: {
        t: 0.3583,
        '10': 0.729,
        '7': 0.1995,
        '8.1': 0.047,
        '8': 0.0109,
        'XP': 0.0087,
        'Vista': 0.0044
    },
    linux: {
        t: 0.0079
    },
    chromeos: {
        t: 0.0049
    }
*/