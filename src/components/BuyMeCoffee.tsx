import { cn } from '../lib/utils';
import React from 'react';

function BuyMeCoffee({
  classname,
  iconClassName,
  textSvgClassName,
}: {
  classname?: string;
  iconClassName?: string;
  textSvgClassName?: string;
}) {
  return (
    <a
      href='https://buymeacoffee.com/uilayouts'
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'border relative group w-64 cursor-pointer h-64 grid place-content-center p-4 bg-neutral-900 rounded-md overflow-hidden',
        classname
      )}
    >
      <svg
        width='424'
        className='absolute top-0 left-0 w-full h-full scale-[2] translate-x-6 group-hover:scale-50 group-hover:opacity-0 duration-300 group-hover:delay-0 delay-200'
        height='424'
        viewBox='0 0 424 424'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M7.40649 39.5516L6.81714 36.5893C6.66936 36.1865 6.40715 35.8672 6.03051 35.6314C5.65387 35.3956 5.26462 35.3515 4.86275 35.4989C3.51103 35.9948 2.71814 37.449 2.48409 39.8616C2.2366 42.2376 2.45543 44.3595 3.14059 46.2271C3.82576 48.0948 4.76689 49.4738 5.96398 50.3642C7.14765 51.218 8.28748 51.4438 9.38347 51.0418C10.516 50.6263 11.4266 50.0014 12.1153 49.167C12.804 48.3327 13.3391 47.3054 13.7204 46.0852C14.5159 43.5082 14.9914 40.7369 15.147 37.7714C15.1974 37.005 15.242 36.4486 15.2807 36.102C15.3558 35.742 15.4848 35.5285 15.6674 35.4615C15.8866 35.3811 16.05 35.4874 16.1574 35.7803C16.6008 36.9888 16.7113 38.5894 16.489 40.5822C16.2668 42.575 16.0313 44.1364 15.7826 45.2664C15.5571 46.3463 15.1873 47.5415 14.6732 48.8519C13.5989 51.5728 11.6917 53.4358 8.95177 54.441C6.86939 55.2049 5.01152 55.0555 3.37814 53.9928C1.76787 52.88 0.653738 51.4813 0.0357491 49.7968C-1.49579 45.622 -1.76282 42.126 -0.76534 39.3087C0.255238 36.4413 2.15378 34.4983 4.93029 33.4798C6.09935 33.0509 7.12686 33.0271 8.01285 33.4084C8.92193 33.7397 9.51753 34.2898 9.79965 35.0589C10.3236 36.4871 10.4575 37.6429 10.2013 38.5263C9.94506 39.4097 9.45163 39.9855 8.72097 40.2535C8.09991 40.4814 7.66175 40.2474 7.40649 39.5516Z'
          className='fill-white'
        />
      </svg>
      <div
        className={cn(
          'relative z-10 w-32 h-36 bg-[#FFDD06] border-white border-2 group-hover:p-0 p-2 rounded-md duration-500 transition-transform ease-in-out group-hover:scale-[1.5] group-hover:translate-y-12',
          iconClassName
        )}
      >
        <svg
          width='223'
          className='w-full h-full'
          height='298'
          viewBox='0 0 223 298'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M34.5 85C34.5 74.2304 43.2304 65.5 54 65.5H169C179.77 65.5 188.5 74.2304 188.5 85V232C188.5 253.539 171.039 271 149.5 271H74C52.4609 271 35 253.539 35 232V85H34.5Z'
            fill='#0F0F0F'
            stroke='#0F0F0F'
            strokeWidth='3'
          />
          <path
            d='M188.5 85C188.5 74.2304 197.23 65.5 208 65.5C218.77 65.5 227.5 74.2304 227.5 85C227.5 95.7696 218.77 104.5 208 104.5C197.23 104.5 188.5 95.7696 188.5 85Z'
            fill='#0F0F0F'
            stroke='#0F0F0F'
            strokeWidth='3'
          />
          <rect x='49' y='85' width='125' height='171' rx='10' fill='#FFDD06' />
          <ellipse cx='111.5' cy='42' rx='45.5' ry='15' fill='#0F0F0F' />
          <path
            d='M66 42C66 48.6274 86.4446 54 111.5 54C136.555 54 157 48.6274 157 42'
            stroke='#0F0F0F'
            strokeWidth='3'
          />
        </svg>
      </div>
      <svg
        width='65'
        height='13'
        className={cn(
          'absolute top-12 opacity-0 group-hover:opacity-100 delay-100 transition-all duration-300 w-full group-hover:scale-[2]',
          textSvgClassName
        )}
        viewBox='0 0 65 13'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle' fill='white' fontSize='8' fontWeight='bold'>
          Buy Me Coffee
        </text>
      </svg>
    </a>
  );
}

export default BuyMeCoffee;
