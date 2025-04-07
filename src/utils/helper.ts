import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

const getUserRole = () => {
    const roleValue = localStorage.getItem('role');
    if (roleValue) {
      return atob(roleValue);
    }
    return roleValue;
  };

export function isFormatDate(isoDateString : any) {
    const date = new Date(isoDateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }

  export function isFormatedDate(isoDateString : any) {
    const date = new Date(isoDateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }

  export function isFormatTime(isoDateString : any) {
    const date = new Date(isoDateString);
  
   // Get the time
   let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');

   // Determine AM or PM
   const ampm = hours >= 12 ? 'PM' : 'AM';

   // Convert to 12-hour format
   hours = hours % 12;
   hours = hours ? hours : 12; // the hour '0' should be '12'
   const formattedHours = String(hours).padStart(2, '0');
  
   // Return time
   return `${formattedHours}:${minutes} ${ampm}`;
  }

  export function formatYYMMDD(isoDateString : any) {
    const date = new Date(isoDateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
  
    return `${year}-${month}-${day}`;
  }


// Function to convert "DD-MM-YYYY" to "YYYY-MM-DD"
// Function to convert dates to "YYYY-MM-DD" format
export function convertDateString(dateInput: any): string {
  // Convert the input to a string and trim any extra spaces
  const dateString = dateInput.toString().trim();

  // Check if the input is a number (Excel serial date)
  if (!isNaN(Number(dateString))) {
    const serialDate = Number(dateString);
    const excelStartDate = new Date(1900, 0, 1); // January 1, 1900
    const date = new Date(excelStartDate.getTime() + (serialDate - 2) * 24 * 60 * 60 * 1000);

    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      throw new Error('Invalid date from serial number');
    }
  } else {
    // Handle cases for various string formats
    const formats = [
      { pattern: /^\d{2}-\d{2}-\d{4}$/, separator: '-', order: ['day', 'month', 'year'] },
      { pattern: /^\d{2}\/\d{2}\/\d{4}$/, separator: '/', order: ['day', 'month', 'year'] },
      { pattern: /^\d{4}-\d{2}-\d{2}$/, separator: '-', order: ['year', 'month', 'day'] },
      { pattern: /^\d{4}\/\d{2}\/\d{2}$/, separator: '/', order: ['year', 'month', 'day'] },
    ];

    for (const { pattern, separator, order } of formats) {
      if (pattern.test(dateString)) {
        const [first, second, third] = dateString.split(separator).map(Number);
        const [day, month, year] = order[0] === 'day' ? [first, second, third] : [third, second, first];

        // Validate and construct the date
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          const formattedDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
          ].join('-');
          return formattedDate;
        } else {
          throw new Error('Invalid date values');
        }
      }
    }
    throw new Error('Date string is in an incorrect format');
  }
}



export const numberToWords = (num: number): string => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
    "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  if (!Number.isFinite(num) || num < 0) return "Invalid Number";

  if (num === 0) return "Zero";

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  };

  return inWords(Math.floor(num));
};







  const formatByDate = (dateString: any) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', options);
  };

  function timeAgo(givenDateString: string) {
    const givenDate = new Date(givenDateString);
    const currentDate = new Date();
    const duration = currentDate.getTime() - givenDate.getTime();
  
    const timeDiffInSeconds = Math.max(Math.floor(duration / 1000), 1); 
    if (timeDiffInSeconds < 60) {
      return `${timeDiffInSeconds} second${timeDiffInSeconds > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < 3600) {
      const minutes = Math.floor(timeDiffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < 86400) {
      const hours = Math.floor(timeDiffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < 604800) {
      const days = Math.floor(timeDiffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < 2592000) {
      const weeks = Math.floor(timeDiffInSeconds / 604800);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (timeDiffInSeconds < 31536000) {
      const months = Math.floor(timeDiffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(timeDiffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  export const getErrorMessage = (error: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined): string => {
    if (error) {
        // Check if error is a FieldError and has a message
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }
    }
    return ''; // Return empty string if error is undefined or does not have a message
};

export const getErrorMessageArray = (error: any) => {
  if (Array.isArray(error)) {
    return error.map(e => e.message).join(', ');
  }
  return error?.message || 'Unknown error';
};



  export {
  getUserRole,
  formatByDate,
  timeAgo,
  }

