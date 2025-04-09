const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toPersianNumber = (number) => {
  if (number === null || number === undefined) return '';
  return number.toString().replace(/\d/g, (d) => persianNumbers[d]);
};

export const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  return toPersianNumber(number);
}; 