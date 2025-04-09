import React from 'react';
import { toPersianNumber } from '../utils/numberUtils';

const PersianNumber = ({ children, className, style }) => {
  const convertToPersian = (value) => {
    if (typeof value === 'number') {
      return toPersianNumber(value);
    }
    if (typeof value === 'string') {
      return value.replace(/\d+/g, (match) => toPersianNumber(parseInt(match)));
    }
    return value;
  };

  return (
    <span className={className} style={style}>
      {convertToPersian(children)}
    </span>
  );
};

export default PersianNumber; 