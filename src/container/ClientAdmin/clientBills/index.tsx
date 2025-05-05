import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getBillPageApi, getBillsApi } from '../../../api-service/client'
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

    //  const getProfileData = useQuery({
    //       queryKey: ['getProfileData'],
    //       queryFn: () => getProfileApi()
    //   })
  
      // const profileData = getProfileData?.data?.data?.result;

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

   const getBillPageData = useQuery({
          queryKey: ['getBillPageData'],
          queryFn: () => getBillPageApi(``),
      })
  
      const billPageData = getBillPageData?.data?.data?.result;


  const handlePrint = (billData: any, billPageData: any) => {
    const printContent = generatePrintContent(billData, billPageData);
    console.log(billData);
    
  
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-10000px";
    iframe.style.left = "-10000px";
    document.body.appendChild(iframe);
  
    const contentWindow = iframe.contentWindow;
    if (!contentWindow) return;
  
    const doc = contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();
  
    iframe.onload = () => {
      setTimeout(() => {
        contentWindow.focus();
        contentWindow.print();
        
        // handleClose()
        // ✅ Immediately refetch your API after triggering print
        // getProductCategoryData.refetch();
  
        // Optional: cleanup the iframe after a second
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };
        
        const generatePrintContent = (billData:any, billPageData:any) => {

          console.log(billData);
          
          const grandTotalAmount = billData?.reduce(
            (sum: number, bill: any) => sum + (bill.totalAmount || 0),
            0
          );
  
          const fontClass = billPageData?.font || "";
          let googleFontLink = "";
          let customFontStyle = "";
          
          if (fontClass) {
            const fontName = fontClass.replace("font-", "").replace(/\+/g, " ");
            googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap" rel="stylesheet">`;
            customFontStyle = `<style>.${fontClass} { font-family: '${fontName}', sans-serif; }</style>`;
          }
          
          
          return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Print Bill</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${googleFontLink}
        ${customFontStyle}
      </head>
      <body>
        <div class="!p-0 !mb-5 !mt-0 w-full h-full ${billPageData?.printSize} ${billPageData?.font}">
        <!-- Invoice Info -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <p class="font-bold">Date Bill</p>
      
           <p class=" flex flex-wrap items-center text-[11px] ml-auto">
              <span class="flex items-center gap-1">
                  <!-- Calendar Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="!h-3 !w-3 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-13 6h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ${isFormatDate(billData[0]?.createdAt)}
              </span>
              </p>
          </div>
          
          <!-- Header Section -->
          <div class="flex flex-col items-center gap-2 mt-3">
            ${billPageData?.header?.logo?.logo_Url
              ? `<img
                  src="${billPageData?.header?.logo?.logo_Url}"
                  alt="Logo"
                  class="${billPageData?.header?.logo?.logoWidth || "w-36"} ${billPageData?.header?.logo?.logoHeight || "h-36"}
                         ${billPageData?.header?.logo?.logoCircle ? "rounded-full" : "rounded"}
                         ${billPageData?.header?.logoZoom ? "object-cover" : "object-fill"}
                         shadow"
                />`
              : ""
          }
      
            ${billPageData?.header?.businessName
              ? `<h1 class="text-2xl font-bold text-center capitalize">${billPageData?.header?.businessName}</h1>`
              : ""
          }
      
            ${billPageData?.header?.address
              ? `<p class="text-center text-xs capitalize">${billPageData?.header?.address}</p>`
              : ""
          }
          </div>
          ${billPageData?.header?.contact
            ? `<div class='flex gap-1 justify-center items-center mt-1'>
                <!-- Phone Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8a1 1 0 01-.293.707L8.414 10.414a16.016 16.016 0 007.172 7.172l1.707-1.707a1 1 0 01.707-.293h1.586a1 1 0 011 1v2.586a2 2 0 01-2 2A17 17 0 013 5z" />
                </svg>
                <p class="text-xs">${billPageData?.header?.contact}</p>
            </div>`
            : ""
        }
      
          <!-- Title -->
           ${billPageData?.showTable ? `<hr class="my-1 border-dashed border-black/80" />` : ``}
          <h2 class="text-center font-semibold text-lg">Cash Bill</h2>
          <hr class=" ${billPageData?.showTable ? `` : 'my-[3px]'} border-dashed border-black/80" />
      
              <!-- Table -->
        <table class="w-[98%] ${billPageData?.showTable ? "border-black/50 border border-collapse" : "border-none"} text-xs mx-auto ${billPageData?.showTable ? `mt-2` : ''}">
            <thead>
              <tr class="bg-gray-400 ${billPageData?.showTable ? "border-black/50 border" : "border-b border-dashed border-black"}">
                <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">S.No</th>
                <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">BillNo</th>
                <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Amount</th>
              </tr>
            </thead>
            <tbody class="${billPageData?.showTable ? "border-black/50 border" : "border-b border-dashed border-black"}">
              ${billData?.map((item: any, index: any) => {
              return `
                  <tr >
                    <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center">${index + 1}</td>
                    <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} capitalize !whitespace-normal">${item.billNo}</td>
                    <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center whitespace-nowrap">₹ ${item?.totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                `;
          }).join("")}
            </tbody>
            <tfoot class="font-medium ">
              <tr class="font-semibold text-sm">
                <td colspan="2" class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Total</td>
                <td class="p-1 border text-center ${billPageData?.showTable ? "border-black/50 border" : "border-none"} whitespace-nowrap">₹ ${Number(grandTotalAmount).toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
      
          ${billPageData?.footer?.terms
              ? `<p class="text-center text-xs mt-4">${billPageData?.footer?.terms}</p>`
              : ""
          }
          <p class="!my-2 text-[11px] !text-center !mb-20">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
        </div>
      </body>
      </html>
      `;  
        };


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
              <button
             onClick={()=>handlePrint(billsData,billPageData)}
              className='flex items-center gap-2 px-3 py-2 bg-primaryColor rounded-md'>Print Today Bill</button>
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