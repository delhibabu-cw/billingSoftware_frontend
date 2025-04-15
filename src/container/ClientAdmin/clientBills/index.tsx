import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getBillsApi } from '../../../api-service/client'
import { isFormatDate, isFormatTime } from '../../../utils/helper'
import { FaEye } from 'react-icons/fa6'
import NoDataFound from '../../../components/noDataFound'
import LoaderScreen from '../../../components/animation/loaderScreen/LoaderScreen'
import DatePickerWithHighlights from './stockCustomCalendar/ReactCustomCalendar'
import BillSingleView from './BillSingleView'

const ClientBills = () => {

  const [search, setSearch] = useState('')
  const [openModal , setOpenModal] = useState(false)
  const [modalId , setModalId] = useState('')
  const getCurrentDate = () => new Date().toISOString().split('T')[0]; // Function to get today's date
  const [highlightDates, setHighlightDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());


  const getBillsData = useQuery({
    queryKey: ['getBillsData', search, selectedDate],
    queryFn: () => getBillsApi(`?search=${search}&date=${selectedDate}`)
  })

  const billsData = getBillsData?.data?.data?.result || [];

  // Filter bills by selected date
  // const filteredBills = billsData.filter((bill: any) => {
  //   return isFormatDate(bill?.createdAt) === isFormatDate(selectedDate);
  // });

  const totalPrice = billsData.reduce((sum: any, bill: any) =>
    sum + bill?.selectedProducts?.reduce((pSum: any, product: any) => pSum + ((product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price) * product?.quantity || 0), 0),
    0
  )

  const totalGst = billsData
    .reduce((sum: number, bill: any) =>
      sum + bill?.selectedProducts?.reduce((gSum: number, product: any) => gSum + (product?.gstAmount || 0), 0),
      0
    )
    .toFixed(2) // Ensures only 2 decimal places

  // const totalGst = Math.round(
  //   billsData.reduce((sum: number, bill: any) => 
  //     sum + bill?.selectedProducts?.reduce((gSum: number, product: any) => gSum + (product?.gstAmount || 0), 0), 
  //     0
  //   ) * 100
  // ) / 100; // Rounds to 2 decimal places


  const totalAmount = billsData.reduce((sum: any, bill: any) => sum + (bill?.totalAmount || 0), 0).toFixed(2);


  // console.log(billsData);
  // console.log(totalAmount);
  // console.log(selectedDate);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await getBillsApi('');
        const result: any[] = res.data?.result || [];

        const dates: string[] = result
          .map((item: any) => item?.createdAt?.split('T')[0])
          .filter((date): date is string => typeof date === 'string');

        setHighlightDates(Array.from(new Set(dates))); // Removes duplicates safely
      } catch (err) {
        console.error('Failed to fetch highlight dates:', err);
      }
    };

    fetchDates();
  }, []);



  return (
    <>
      <div className='relative pt-24 lg:pt-32 px-[4%] pb-10'>
        <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
        <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>
        <div className="flex flex-col gap-3 ">
          <div className="flex flex-wrap items-center justify-between w-full gap-3 md:flex-nowrap">
            <input
              type="search"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BillNo Here..."
              className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className='flex items-center gap-2 px-3 py-2 bg-primaryColor rounded-3xl'>
                <div className='flex gap-1 text-black/80'>
                  <p>Total Amount</p>
                  <p>:</p>
                </div>
                <p className='text-lg font-bold font-OpenSans'><span>₹</span> {Number(totalAmount).toLocaleString('en-IN')}</p>
              </div>
              <DatePickerWithHighlights
                selectedDate={selectedDate}
                onDateChange={(newDate) => setSelectedDate(newDate)}
                highlightDates={highlightDates}
              />

            </div>
          </div>
          <div>
            {billsData?.length > 0 ? (
              <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                  <thead className="text-white/80 bg-white/15">
                    <tr className="">
                      <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Bill No</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">customer</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Employee</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Date & Time</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Total Price</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">GST Amount</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Total Amount</td>
                      <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                    </tr>
                  </thead>
                  <tbody className="">

                    {billsData?.map((idx: any, index: number) => (
                      <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                        <td className="p-3 text-white/80">{index + 1}.</td>
                        <td className="p-3">
                          <p className="font-semibold text-white">{idx?.billNo ? idx?.billNo : "-"}</p>
                        </td>
                        <td className="p-3 text-white capitalize ">
                          {idx?.customer ? (idx?.customer?.name === '' ? '-' : (
                            <div>
                              <p className='text-sm'>{idx?.customer?.name}</p>
                              <p className='text-xs text-white/80'>{idx?.customer?.mobile}</p>
                            </div>
                          )) : '-'}
                        </td>

                        <td className="p-3 ">
                          <div className='text-white capitalize '>
                            {idx?.employee ? (idx?.employee?.fullName === '' ? '-' : (
                              <div>
                                <p className='text-sm'>{idx?.employee?.fullName}</p>
                                <p className='text-xs text-white/80'>{idx?.employee?.unquieId}</p>
                              </div>
                            )) : '-'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-white capitalize"><span className='text-sm'>{isFormatDate(idx?.createdAt)}</span> <span className='text-xs text-white/80'>{isFormatTime(idx?.createdAt)}</span></div>
                        </td>
                        <td className="p-3">
                          <div className="text-white">₹ {Number(idx?.selectedProducts?.reduce((pSum: any, product: any) => pSum + (product?.gstWithoutTotal || 0), 0).toFixed(2)).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-white">₹ {idx?.selectedProducts?.reduce((gSum: any, product: any) => gSum + (product?.gstAmount || 0), 0).toFixed(2)}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-white">₹ {(idx?.totalAmount).toLocaleString('en-IN')}</div>
                        </td>

                        <td className="flex gap-2 p-3">
                          <button
                            className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                          onClick={() => { setOpenModal(true), setModalId(idx?._id) }}
                          >
                            <FaEye className="" />
                          </button>
                        </td>
                      </tr>
                    ))}



                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-white/20 border-white/30">
                      <td className="p-3 text-lg font-bold text-white" colSpan={5}>Total</td>
                      <td className="p-3 text-lg font-medium text-white">₹ {(totalPrice).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-lg font-medium text-white">₹ {(totalGst).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-lg font-bold text-white">₹ {Number(totalAmount).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-lg font-bold text-white" colSpan={1}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : <NoDataFound />}
          </div>
        </div>
      </div>

      {(getBillsData.isLoading || getBillsData.isFetching) && <LoaderScreen />}

      {openModal && <BillSingleView openModal={openModal} handleClose={()=>setOpenModal(!openModal)} modalId={modalId}/>}
    </>
  )
}

export default ClientBills