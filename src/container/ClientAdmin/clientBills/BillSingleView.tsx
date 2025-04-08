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

    const handlePrint = ()=>{
        setTimeout(() => {
            const printContent = document.getElementById("printArea");
            if (printContent) {
              const originalContent = document.body.innerHTML;
              document.body.innerHTML = printContent.innerHTML;
              window.print();
              document.body.innerHTML = originalContent;
              window.location.reload(); // Reload to restore original content
            }
          }, 500);
    }

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[96%]  overflow-hidden border-[1.5px] border-white/50">
                    {/* <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">Bill</h2>
                        <button
                            type="button"
                            className="text-white/80 hover:text-primaryColor hover:scale-105"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div> */}
                    <div id="printArea" className={`h-full p-4 border rounded-tl-md rounded-tr-md shadow-md bg-white font-OpenSans overflow-y-auto hide-scrollbar  ${billPageData?.printSize}`}>
                        <div className="grid grid-cols-3 gap-3">
                            <p className="text-xl font-bold ">Invoice</p>
                            {billPageData?.invoiceFields?.showInvoiceNo ? (
                                <p className="text-sm text-center">Bill No: <span className="text-base font-semibold">{billData?.billNo}</span></p>
                            ) : (<p></p>)}

                            {/* <p className="text-[12px] text-end">Date & Time: <span className="font-medium">{isFormatDate(billData?.createdAt)}</span><span className="text-[10px] ms-1">{isFormatTime(billData?.createdAt)}</span></p> */}
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
                                <p className="max-w-md mt-4 text-xl font-bold text-center md:text-2xl font-Poppins">{billPageData?.header?.businessName}</p>
                            )}
                            {billPageData?.header?.address && (
                                <p className="flex flex-wrap w-full !max-w-md mt-1 md:mt-2 font-medium text-center text-sm md:text-base font-Poppins justify-center">{billPageData?.header?.address}</p>
                            )}
                        </div>

                        <div className="flex justify-between mt-2">
                            {billPageData?.invoiceFields?.showCustomer && (
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
                            {billPageData?.invoiceFields?.showEmployee && (
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
                        onClick={()=>handlePrint()}>Print</button>
                    </div>
                </div>
            </div>

            {(getBillPageData?.isLoading || getBillPageData?.isFetching || getProfileData.isLoading || getBillData?.isLoading || getBillData?.isFetching) && <LoaderScreen />}
        </>
    )
}

export default BillSingleView