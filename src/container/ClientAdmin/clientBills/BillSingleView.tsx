import { useQuery } from '@tanstack/react-query';
import { getBillPageApi, getBillsApi } from '../../../api-service/client';
import { getProfileApi } from '../../../api-service/authApi';
import { isFormatDate, isFormatTime } from '../../../utils/helper';
import LoaderScreen from '../../../components/animation/loaderScreen/LoaderScreen';
import { MdAccessTime, MdDateRange } from 'react-icons/md';

const BillSingleView = ({ openModal, handleClose, modalId }: any) => {

    if (!openModal) return null;

    const getBillPageData = useQuery({
        queryKey: ['getBillPageData'],
        queryFn: () => getBillPageApi(``),
        enabled: !!modalId, // only run when billData exists
    })

    const billPageData = getBillPageData?.data?.data?.result;

    const getProfileData = useQuery({
        queryKey: ['getProfileData'],
        queryFn: () => getProfileApi()
    })

    const profileData = getProfileData?.data?.data?.result;

    const getBillData = useQuery({
        queryKey: ['getBillData', modalId],
        queryFn: () => getBillsApi(`/${modalId}`)
    })


    const billData = getBillData?.data?.data?.result;

    const totalPrice = billData?.selectedProducts.reduce(
        (sum: any, product: any) => sum + ((product?.productAddedFromStock === 'yes' ? product?.actualPrice : product.price) * product.quantity || 0),
        0
    ).toLocaleString('en-IN');

    const totalGst = billData?.selectedProducts
        .reduce((sum: any, product: any) => sum + (product.gstAmount || 0), 0)
        .toFixed(2).toLocaleString('en-IN');


    //   useEffect(() => {
    //     if (billPageData) {
    //       setTimeout(() => {
    //         const printContent = document.getElementById("printArea");
    //         if (printContent) {
    //           const originalContent = document.body.innerHTML;
    //           document.body.innerHTML = printContent.innerHTML;
    //           window.print();
    //           document.body.innerHTML = originalContent;
    //           window.location.reload(); // Reload to restore original content
    //         }
    //       }, 500);
    //     }
    //   }, [billPageData]);

    // const handlePrint = ()=>{
    //     setTimeout(() => {
    //         const printContent = document.getElementById("printArea");
    //         if (printContent) {
    //           const originalContent = document.body.innerHTML;
    //           document.body.innerHTML = printContent.innerHTML;
    //           window.print();
    //           document.body.innerHTML = originalContent;
    //           window.location.reload(); // Reload to restore original content
    //         }
    //       }, 500);
    // }

    const handlePrint = (billData: any, billPageData: any) => {
      const printContent = generatePrintContent(billData, billPageData);
    
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
          
          handleClose()
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
            const totalPrice = billData?.selectedProducts.reduce(
              (sum:any, product:any) =>
                sum +
                ((product?.productAddedFromStock === "yes"
                  ? product?.actualPrice
                  : product?.price) *
                  product.quantity || 0),
              0
            );
          
            const totalGst = billData?.selectedProducts.reduce(
              (sum:any, product:any) => sum + (product.gstAmount || 0),
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
          <div class="!p-0 w-full h-full ${billPageData?.printSize} ${billPageData?.font}">
          <!-- Invoice Info -->
            <div class="grid grid-cols-3 gap-3 text-sm">
              <p class="font-bold text-lg">Invoice</p>
        
              ${billPageData?.invoiceFields?.showInvoiceNo
                ? `<p class="text-center">Bill No: <span class="font-semibold">${billData?.billNo}</span></p>`
                : `<p></p>`
            }
        
             <p class="text-right flex justify-end gap-1 flex-wrap items-center text-xs">
                <span class="flex items-center gap-1">
                    <!-- Calendar Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="!h-4 !w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-13 6h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ${isFormatDate(billData?.dateTime)}
                </span>
                <span className='hidden md:block'>|</span>
                <span class="flex items-center gap-1">
                    <!-- Clock Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${isFormatTime(billData?.dateTime)}
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
                ? `<h1 class="text-2xl font-bold text-center">${billPageData?.header?.businessName}</h1>`
                : ""
            }
        
              ${billPageData?.header?.address
                ? `<p class="text-center text-sm">${billPageData?.header?.address}</p>`
                : ""
            }
            </div>
        
            <!-- Parties -->
            <div class="flex justify-between mt-4 text-sm">
              ${billPageData?.invoiceFields?.showCustomer
                ? `<div>
                    <p class="font-medium text-base">Customer Details</p>
                    <div className='flex flex-col gap-1'>
                    <p className='text-sm'>Name: <span class="font-semibold">${billData?.customer?.name || ""}</span></p>
                    <p className='text-sm'>Mobile: <span class="font-semibold">${billData?.customer?.mobile || ""}</span></p>
                    </div>
                  </div>`
                : ""
            }
        
              ${billPageData?.invoiceFields?.showEmployee
                ?
                `<div>
                    <p class="font-medium text-base">Employee Details</p>
                    <div className='flex flex-col gap-1'>
                    <p className='text-sm'>Name: <span class="font-semibold">${billData?.employee?.fullName || ""}</span></p>
                    <p className='text-sm'>Mobile: <span class="font-semibold">${billData?.employee?.unquieId || ""}</span></p>
                    </div>
                  </div>`
                : ""
            }
            </div>
        
            <!-- Title -->
            <hr class="my-1 border-dashed border-black/80" />
            <h2 class="text-center font-semibold text-lg">Cash Bill</h2>
            <hr class="my-1 border-dashed border-black/80" />
        
                <!-- Table -->
            <table class="w-full border border-collapse text-xs mt-2 border-black/30">
              <thead>
                <tr class="bg-gray-400">
                  <th class="p-1 border border-black/30">S.No</th>
                  <th class="p-1 border border-black/30">Product</th>
                  <th class="p-1 border border-black/30">Price</th>
                  <th class="p-1 border border-black/30">Qty</th>
                  <th class="p-1 border border-black/30">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${billData?.selectedProducts?.map((item: any, index: any) => {
                const price = item.productAddedFromStock === "yes" ? item.actualPrice : item.price;
                const amount = price * item.quantity;
                return `
                    <tr>
                      <td class="p-1 border border-black/30 text-center">${index + 1}</td>
                      <td class="p-1 border border-black/30 text-center">${item.name}</td>
                      <td class="p-1 border border-black/30 text-center whitespace-nowrap">₹ ${price.toLocaleString("en-IN")}</td>
                      <td class="p-1 border border-black/30 text-center">${item.quantity}</td>
                      <td class="p-1 border border-black/30 text-center whitespace-nowrap">₹ ${amount.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
            }).join("")}
              </tbody>
              <tfoot class="font-medium">
                ${profileData?.overAllGstToggle === "on"
                ? `
                      <tr>
                        <td colspan="4" class="p-1 border border-black/30 text-right pr-2">Sub Total</td>
                        <td class="p-1 border text-center border-black/30">₹ ${totalPrice.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td colspan="4" class="p-1 border border-black/30 text-right pr-2">GST (${profileData?.gstPercentage}%)</td>
                        <td class="p-1 border text-center border-black/30">₹ ${totalGst.toLocaleString("en-IN")}</td>
                      </tr>
                    `
                : ""
            }
                <tr class="font-semibold text-base">
                  <td colspan="4" class="p-1 border border-black/30 text-right pr-2">Total</td>
                  <td class="p-1 border text-center border-black/30">₹ ${Number(billData?.totalAmount).toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
        
            ${billPageData?.footer?.terms
                ? `<p class="text-center text-xs mt-4">${billPageData?.footer?.terms}</p>`
                : ""
            }
            <p class="!my-2 text-[11px] !text-center">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
          </div>
        </body>
        </html>
        `;      
          };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[96%]  overflow-hidden border-[1.5px] border-white/50">
                    <div id="printArea" className={`h-full p-4 border rounded-tl-md rounded-tr-md shadow-md bg-white  overflow-y-auto hide-scrollbar  ${billPageData?.printSize} ${billPageData?.font}`}>
                        <div className="grid grid-cols-3 gap-3">
                            <p className="text-xl font-bold ">Invoice</p>
                            {billPageData?.invoiceFields?.showInvoiceNo ? (
                                <p className="text-sm text-center">Bill No: <span className="text-base font-semibold">{billData?.billNo}</span></p>
                            ) : (<p></p>)}

                            <p className="text-[12px] text-end">
                                <span className='flex flex-wrap items-center justify-end gap-1'>
                                    <span className='flex flex-wrap items-center justify-center gap-1'><MdDateRange className='text-lg'/><span className="text-[11px] font-medium">{isFormatDate(billData?.createdAt)}</span></span>
                                     <span className='hidden md:block'>|</span>
                                     <span className='flex flex-wrap items-center justify-center gap-1'><MdAccessTime className='text-lg'/><span className="font-medium text-[11px]">{isFormatTime(billData?.createdAt)}</span></span>
                                     </span>
                                     </p>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1 mt-3">
                            {billPageData?.header?.logo?.logo_Url && (
                                <img
                                    src={billPageData?.header?.logo?.logo_Url}
                                    className={`${billPageData?.header?.logo?.logoWidth === '' ? 'w-36' : `${billPageData?.header?.logo?.logoWidth} object-cover`} ${billPageData?.header?.logo?.logoCircle ? 'rounded-full' : 'rounded'} 
                    ${billPageData?.header?.logo?.logoHeight === '' ? "h-36" : `${billPageData?.header?.logo?.logoHeight}`} ${billPageData?.header?.logoZoom ? 'object-cover' : 'object-fill'} shadow-lg `}
                                    alt=""
                                />
                            )}
                            {billPageData?.header?.businessName && (
                                <p className="max-w-md mt-4 text-xl font-bold text-center md:text-2xl ">{billPageData?.header?.businessName}</p>
                            )}
                            {billPageData?.header?.address && (
                                <p className="flex flex-wrap w-full !max-w-md mt-1 md:mt-2 font-medium text-center text-sm md:text-base justify-center">{billPageData?.header?.address}</p>
                            )}
                        </div>

                        <div className="flex justify-between mt-2">
                            {profileData?.customerToggle === 'on' && (
                                <div>
                                    <p className="text-lg font-medium">Customer Details</p>
                                    <div className="flex items-center gap-2 mt-1 text-sm">
                                        <p>Name :</p>
                                        <p className="font-medium capitalize">{billData?.customer?.name ? billData?.customer?.name : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-[2px] text-sm">
                                        <p>Mobile :</p>
                                        <p className="font-medium ">{billData?.customer?.mobile ? billData?.customer?.mobile : ''}</p>
                                    </div>
                                </div>
                            )}
                            {profileData?.employeeToggle === 'on' && (
                                <div>
                                    <p className="text-lg font-medium">Employee Details</p>
                                    <div className="flex items-center gap-2 mt-1 text-sm">
                                        <p>Name :</p>
                                        <p className="font-medium capitalize">{billData?.employee?.fullName ? billData?.employee?.fullName : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-[2px] text-sm">
                                        <p>ID :</p>
                                        <p className="font-medium ">{billData?.employee?.unquieId ? billData?.employee?.unquieId : ""}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="mt-2 border border-collapse border-dashed border-black/80 border-x-8" />
                        <p className="py-1 text-xl font-semibold text-center">Cash Bill</p>
                        <hr className="mb-2 border border-collapse border-dashed border-black/80 border-x-8" />
                        <table className="w-full mt-4 border border-collapse">
                            <thead>
                                <tr className="">
                                    <th className="p-2 border">S.No</th>
                                    <th className="p-2 border">Product</th>
                                    <th className="p-2 border">Price</th>
                                    <th className="p-2 border">Quantity</th>
                                    <th className="p-2 border">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billData?.selectedProducts?.map((item: any, index: any) => (
                                    <tr key={index}>
                                        <td className="p-2 border">{index + 1}</td>
                                        <td className="p-2 border">{item?.name}</td>
                                        <td className="p-2 border">₹ {(item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price)}</td>
                                        <td className="p-2 border">{item?.quantity}</td>
                                        <td className="p-2 border">₹ {((item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price) * item?.quantity).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                {profileData?.overAllGstToggle === 'on' && (
                                    <>
                                        <tr className="">
                                            <td className="p-2 text-sm font-medium border" colSpan={4}>Sub Total</td>
                                            <td className="p-2 text-sm font-medium border" colSpan={1}>₹{totalPrice}</td>
                                        </tr>
                                        <tr className="">
                                            <td className="p-2 text-sm font-medium border" colSpan={4}>GST({profileData?.gstPercentage}%)</td>
                                            <td className="p-2 text-sm font-medium border" colSpan={1}>₹ {totalGst}</td>
                                        </tr>
                                    </>
                                )}
                                <tr className="">
                                    <td className="p-2 text-sm font-semibold border" colSpan={4}>Total</td>
                                    <td className="p-2 text-sm font-bold border" colSpan={1}>₹ {Number(billData?.totalAmount).toLocaleString('en-IN')}</td>
                                </tr>
                            </tfoot>

                        </table>
                        <div className="flex items-center justify-between w-full gap-3 mt-3">
                            <div>
                                {billPageData?.footer?.terms && (
                                    <p className="flex max-w-sm text-xs font-semibold capitalize md:text-sm md:text-center">{billPageData?.footer?.terms}</p>
                                )}
                            </div>
                            <div>
                                {billPageData?.footer?.signature && (
                                    <img src={billPageData?.footer?.signature} className="object-cover w-20 border rounded h-14 md:h-20 md:w-36" alt="" />
                                )}
                            </div>
                        </div>
                        <p className="mt-2 text-[11px] text-center">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
                    </div>
                    <div className='flex gap-2 px-4 py-3 ml-auto'>
                        <button className='px-3 py-2 bg-white rounded-md' onClick={handleClose}>Cancel</button>
                        <button className='px-3 py-2 rounded-md bg-primaryColor'
                        onClick={()=>handlePrint(billData,billPageData)}>Print</button>
                    </div>
                </div>
            </div>

            {(getBillPageData?.isLoading || getBillPageData?.isFetching || getProfileData.isLoading || getBillData?.isLoading || getBillData?.isFetching) && <LoaderScreen />}
        </>
    )
}

export default BillSingleView