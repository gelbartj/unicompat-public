const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

export const formatDate = (date: string) => {
    if (date) {
      return months[parseInt(date.split("-")[1]) - 1] + " " + date.split("-")[0];
    }
    return "";
  };

  export function leftPad(slug: string, length = 4) {
    if (!slug) return slug;
    while (slug.length < length) {
      slug = "0" + slug;
    }
    return slug;
  }

  export const getUserPercentClass = (userPercent: number, isBrowser?: boolean,
    bitmap?: string) => {

    if (userPercent > 95) {
      return "great";
    }
    if (userPercent > 90) {
      return "vgood";
    }
    if (userPercent > 85) {
      return "good";
    }
    if (userPercent > 80) {
      return "ok";
    }
    if (userPercent > 70) {
      return "fair";
    }
    if (userPercent > 60) {
      return "poor";
    }
    if (userPercent === 0) {
      if (!bitmap && isBrowser) return "vpoor";
      return "none";
    }
    
    return "vpoor";
  };