'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import jalaali from 'jalaali-js';
import Image from 'next/image';
import { findPreviousDay } from '@/utils/findPreviousDay';

interface Occasion {
  ShortTitle: string;
  EventTitle: string;
  Georgian: string;
  GeorgianK: string;
  ModalImageLink: string;
  ModalStatus: boolean;
  PersianDayNumber: number;
  PersianDayNumberK: number;
  RefLink: string;
  Text: string;
  importantDay: boolean;
  Month: string;
  LogoLink: string;
}

const Occasions: React.FC = () => {
  const [currentMonthEvents, setCurrentMonthEvents] = useState<Occasion[]>([]);
  const [currentMonthName, setCurrentMonthName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Occasion | null>(null);
  const [previousDay, setPreviousDay] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(
    jalaali.toJalaali(new Date()).jy
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const leapYears = useMemo(
    () => [
      1403, 1407, 1411, 1415, 1419, 1423, 1427, 1431, 1435, 1439, 1443, 1447,
      1451, 1455, 1459, 1463, 1467, 1471, 1475, 1479, 1483, 1487, 1491, 1495,
      1499, 1503, 1507, 1511, 1515, 1519, 1523, 1527, 1531, 1535, 1539, 1543,
      1547, 1551, 1555, 1559, 1563, 1567, 1571, 1575, 1579, 1583, 1587, 1591,
      1595, 1599,
    ],
    []
  );

  const isLeapYear = useCallback(
    (year: number) => leapYears.includes(year),
    [leapYears]
  );

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const monthMapping = useMemo(
    () => ({
      فروردین: 1,
      اردیبهشت: 2,
      خرداد: 3,
      تیر: 4,
      اَمُرداد: 5,
      شهریور: 6,
      مهر: 7,
      آبان: 8,
      آذر: 9,
      دی: 10,
      بهمن: 11,
      اسفند: 12,
    }),
    []
  );

  const georgianMonthMapping = useMemo(
    () => [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    []
  );

  const formatGeorgianDate = (date: string) => {
    const [day, month] = date.split(',').map(Number);
    return `${day} ${georgianMonthMapping[month - 1]}`;
  };

  const fetchOccasions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/occasions');
      if (!response.ok) {
        throw new Error('Failed to fetch occasions');
      }
      const data = await response.json();

      // Extract occasions array from the response
      const occasions = data.occasions || [];

      // Filter occasions for the current month
      const today = new Date();
      const jToday = jalaali.toJalaali(today);
      const currentMonthName = Object.keys(monthMapping).find(
        (key) => monthMapping[key] === jToday.jm
      );

      const filteredOccasions = occasions.filter(
        (occ) => occ.Month === currentMonthName
      );

      // Sort occasions by day number
      const sortedOccasions = [...filteredOccasions].sort((a, b) => {
        const dayA = isLeapYear(currentYear)
          ? a.PersianDayNumberK
          : a.PersianDayNumber;
        const dayB = isLeapYear(currentYear)
          ? b.PersianDayNumberK
          : b.PersianDayNumber;
        return dayA - dayB;
      });

      setCurrentMonthEvents(sortedOccasions);
    } catch (error) {
      console.error('Error fetching occasions:', error);
      setCurrentMonthEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentYear, isLeapYear, monthMapping]); // Only depend on stable values

  // Fetch occasions only on mount and when month/year changes
  useEffect(() => {
    fetchOccasions();
  }, [fetchOccasions]);

  // Set current month name separately
  useEffect(() => {
    const today = new Date();
    const jToday = jalaali.toJalaali(today);
    const newName = Object.keys(monthMapping).find(
      (key) => monthMapping[key] === jToday.jm
    );
    setCurrentMonthName(newName || '');
  }, [monthMapping]);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      const today = new Date();
      const todayPersianDayNumber = jalaali.toJalaali(today).jd;
      const todayPersianDayNumberK = isLeapYear(currentYear)
        ? todayPersianDayNumber
        : todayPersianDayNumber;

      const targetEventIndex = currentMonthEvents.findIndex((event) =>
        isLeapYear(currentYear)
          ? event.PersianDayNumberK === todayPersianDayNumberK
          : event.PersianDayNumber === todayPersianDayNumber
      );

      if (targetEventIndex !== -1) {
        const targetEventElement = scrollRef.current.children[
          targetEventIndex
        ] as HTMLDivElement;
        targetEventElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start', // Scrolls the event to the center of the viewport
        });
        window.scrollBy(0, -100);
      }
    }
  }, [loading, currentMonthEvents, currentYear, isLeapYear]);

  const handleMonthChange = (increment: number) => {
    const currentMonthIndex = monthMapping[currentMonthName];
    let newMonthIndex = currentMonthIndex + increment;

    if (newMonthIndex > 12) {
      newMonthIndex = 1;
      setCurrentYear(currentYear + 1);
    } else if (newMonthIndex < 1) {
      newMonthIndex = 12;
      setCurrentYear(currentYear - 1);
    }

    const newMonthName = Object.keys(monthMapping).find(
      (key) => monthMapping[key] === newMonthIndex
    );
    setCurrentMonthName(newMonthName || '');
    fetchOccasions();
  };

  const resetToToday = () => {
    const today = new Date();
    const jToday = jalaali.toJalaali(today);
    setCurrentYear(jToday.jy);
    const newName = Object.keys(monthMapping).find(
      (key) => monthMapping[key] === jToday.jm
    );
    setCurrentMonthName(newName || '');
    fetchOccasions();
  };

  const handleDayClick = (occasion: Occasion) => {
    if (occasion.ModalStatus) {
      setModalContent(occasion);
      setModalVisible(true);
    }
  };

  const toPersianNum = (num: string) => {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num
      .toString()
      .split('')
      .map((digit) => persianNumbers[parseInt(digit, 10)] || digit)
      .join('');
  };

  const safeToString = (value: any): string => {
    if (value === undefined || value === null) {
      return '';
    }
    return value.toString();
  };

  const today = new Date();
  const jToday = jalaali.toJalaali(today);
  const todayPersianDayNumber = jToday.jd;
  const todayPersianMonth = jToday.jm;
  const currentDisplayYear = currentYear;
  const todayPersianDayNumberK = isLeapYear(currentDisplayYear)
    ? todayPersianDayNumber
    : todayPersianDayNumber;
  const leapYearText = isLeapYear(currentDisplayYear)
    ? '   امسال کبیسه (انباشته) است  '
    : '';

  // const persianDate = `(${toPersianNum(todayPersianDayNumber.toString())} ${[todayPersianMonth]})`;
  const persianMonthName = Object.keys(monthMapping).find(
    (key) => monthMapping[key] === todayPersianMonth
  );
  const persianDate = `(${toPersianNum(todayPersianDayNumber.toString())} ${persianMonthName})`;
  console.log(persianDate); // This prints "۱۲ شهریور"

  return (
    <div className='bg-[#333863] min-h-screen flex flex-col items-center justify-center pt-24 pb-96'>
      <div className='bg-[#4c5494] shadow-lg rounded-lg px-4 py-6 w-full text-center text-xl md:text-2xl font-bold text-white fixed top-0 flex justify-between items-center z-10'>
        <div className='flex items-center justify-between w-full'>
          <button
            onClick={() => handleMonthChange(1)}
            className='text-4xl md:text-5xl flex-shrink-0'
          >
            &lt;
          </button>

          <button
            onClick={resetToToday}
            className='border border-white h-6 text-[10px] sm:text-sm md:text-lg rounded transition-colors duration-300 text-white hover:bg-white hover:text-[#333863] active:bg-gray-700 active:text-white flex-shrink-0 mx-2'
            style={{
              lineHeight: '1rem',
              padding: '0 0.5rem',
              height: '24px',
            }}
          >
            برو به این ماه
          </button>

          <div className='flex items-center'>
            <h1 className='text-xs sm:text-sm md:text-lg mx-2'>
              سال {toPersianNum(currentDisplayYear.toString())}
              <span className='block'>{leapYearText}</span>
              <p className='text-xs pr-2 pl-2 font-bold text-gray-300 shadow-black shadow-inner mt-1 rounded-sm min-w-12 pt-1'>
                {persianDate}
              </p>
            </h1>
            <p className='text-xs sm:text-sm md:text-lg mx-2 m'>
              فراخورهای ماه {currentMonthName}
            </p>
          </div>

          <button
            onClick={() => handleMonthChange(-1)}
            className='text-4xl md:text-5xl flex-shrink-0'
          >
            &gt;
          </button>
        </div>
      </div>

      {loading ? (
        <div className='mt-10 text-center text-white'>
          ... در حال بارگزاری فراخور های پیش رو
        </div>
      ) : (
        <div
          ref={scrollRef}
          className='grid grid-cols-2 lg:grid-cols-6 gap-4 mt-5 w-full p-3 lg:mt-8 pb-40 mb-40'
          style={{ direction: 'rtl' }}
        >
          {currentMonthEvents.map((event, index) => {
            const isToday =
              monthMapping[event.Month] === todayPersianMonth &&
              (isLeapYear(currentYear)
                ? event.PersianDayNumberK === todayPersianDayNumberK
                : event.PersianDayNumber === todayPersianDayNumber);
            const logo = event.LogoLink
              ? event.LogoLink // If event.LogoLink is valid, use it
              : isToday
                ? '/assets/LogoMobMain.png' // If it's today, use the asset from public folder
                : 'https://gahshomar.com/wp-content/uploads/2024/08/gahshomar-dark.svg'; // Otherwise, use the default logo

            return (
              <div
                key={`${event.PersianDayNumber}-${event.Georgian}-${index}`}
                onClick={() => handleDayClick(event)}
                className={`relative h-[180px] ${
                  isToday
                    ? 'bg-[#4c5494] border-4 border-[#FF8200] shadow-lg'
                    : 'bg-[#FFFFFF]'
                } shadow-md rounded-lg p-2 text-center mb-2`}
                style={{ width: '100%', maxWidth: '350px' }}
              >
                <div className={`absolute bottom-2 left-2 w-8 h-8`}>
                  <Image
                    src={logo}
                    alt='Logo Of the Day'
                    width={32}
                    height={32}
                    className='object-contain'
                    priority
                  />
                </div>
                <div className='flex flex-col h-full'>
                  <span
                    className={`text-3xl sm:text-2xl font-bold ${isToday ? 'text-[#FFFFFF] ' : 'text-gray-700'}`}
                  >
                    {toPersianNum(
                      isLeapYear(currentDisplayYear)
                        ? safeToString(event?.PersianDayNumberK)
                        : safeToString(event?.PersianDayNumber)
                    )}
                  </span>
                  <span className='text-[#CAB9B9] text-[17px] sm:text-lg pb-[-5px] '>
                    {toPersianNum(currentMonthName)}
                  </span>
                  <div
                    className={`static ${
                      event.ModalStatus ? 'cursor-pointer' : 'cursor-default'
                    } ${isToday ? 'text-[#FFFFFF] ' : 'text-[#373636] '}
            text-center`}
                    style={{
                      fontSize:
                        event.ShortTitle.length > 16
                          ? '0.72rem'
                          : event.ShortTitle.length > 12
                            ? '0.89rem'
                            : event.ShortTitle.length > 8
                              ? '1.0rem'
                              : event.ShortTitle.length > 7
                                ? '1.0rem'
                                : '0.89rem',
                    }}
                  >
                    {event.ShortTitle}
                  </div>
                </div>
                <div className='relative' style={{ direction: 'ltr' }}>
                  <div
                    className={` ${
                      isToday
                        ? 'text-gray-300 font-extrabold text-lg'
                        : 'text-[#2a5b71]'
                    } rounded-lg text-center `}
                    style={{
                      position: 'absolute', // Ensure it stays at the bottom
                      bottom: '0px',
                      width: '100%',
                      // paddingBottom: '0px', // Add padding to ensure there's space
                    }}
                  >
                    {formatGeorgianDate(
                      isLeapYear(currentDisplayYear)
                        ? event.GeorgianK
                        : event.Georgian
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className='w-full flex flex-col items-center justify-center mt-20 mb-40 text-white/80 text-sm px-4'>
        <div className='max-w-2xl text-center space-y-4'>
          <h3 className='text-lg font-semibold mb-4'>درباره گاه سنج </h3>
          <p>
            گاه سنج یک تقویم هوشمند است که رویدادهای مهم و مناسبت‌های ایرانی را
            به شما یادآوری می‌کند.
          </p>
          <p>
            با استفاده از گاه سنج می‌توانید از تمامی مناسبت‌ها و رویدادهای مهم
            مطلع شوید.
          </p>
          <p>
            همچنین می‌توانید رویدادهای شخصی خود را ثبت کنید و در زمان مناسب
            یادآوری دریافت کنید.
          </p>
          <div className='h-20'></div>
          <p className='text-xs opacity-50'>
            تمامی حقوق برای گاه سنج محفوظ است © {new Date().getFullYear()}
          </p>
        </div>
      </div>
      <div className='w-full h-60'></div>
      {modalVisible && modalContent && (
        <div
          className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-[9999]'
          onClick={() => setModalVisible(false)} // Close modal when clicking outside
        >
          <div
            className='relative bg-white p-2 sm:p-8 rounded-lg shadow-lg max-w-[90%] w-full max-h-[80vh] overflow-auto flex flex-col items-center z-[10000]'
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close button at top-right */}
            <button
              className='absolute top-3 right-3 text-gray-600 hover:text-gray-800 font-bold text-xl'
              onClick={() => setModalVisible(false)} // Close modal on clicking the button
            >
              &times;
            </button>

            <h1 className='text-xl sm:text-3xl font-bold text-[#393939] mb-4 text-center'>
              {modalContent.EventTitle}
            </h1>
            <div className='w-52 mb-4'>
              <Image
                src={
                  modalContent.ModalImageLink ||
                  'https://gahshomar.com/wp-content/uploads/2024/08/gahshomar-dark.svg'
                }
                alt='Modal Image'
                className='h-full sm-logo:w-[30px] sm-logo:h-[20px] w-2'
                layout='responsive'
                width={30}
                height={30}
              />
            </div>
            <p className='text-sm sm:text-[#707070] mb-4 text-justify'>
              {modalContent.Text}
            </p>
            {modalVisible && modalContent.RefLink && (
              <p className='text-center mt-4 p-3'>
                برای اطلاعات بیشتر{' '}
                <a
                  href={modalContent.RefLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 underline'
                >
                  اینجا را کلیک کنید
                </a>{' '}
              </p>
            )}
            <button
              className='px-3 sm:px-4 py-1 sm:py-2 bg-[#FF8200] text-white rounded'
              onClick={() => setModalVisible(false)} // Manually close modal on button click
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Occasions;
