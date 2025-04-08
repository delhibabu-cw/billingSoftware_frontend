import { isFormatDate, isFormatTime } from "../../utils/helper";
import { useQuery } from "@tanstack/react-query";
import { getBillPageApi } from "../../api-service/client";
import { getProfileApi } from "../../api-service/authApi";
import { useEffect } from "react";
import LoaderScreen from "../animation/loaderScreen/LoaderScreen";

const BillComponent = ({ billData }: any) => {

  console.log(billData);

  const getBillPageData = useQuery({
    queryKey : ['getBillPageData'],
    queryFn: ()=> getBillPageApi(``),
    enabled: !!billData, // only run when billData exists
  })

  const billPageData = getBillPageData?.data?.data?.result;
  
  const getProfileData = useQuery({
    queryKey : ['getProfileData'],
    queryFn: ()=> getProfileApi()
  })

  const profileData = getProfileData?.data?.data?.result;

//   const totalAmount = billData.reduce((sum: any, bill: any) => sum + (bill?.totalAmount || 0), 0).toFixed(2);
const totalPrice = billData?.selectedProducts.reduce(
    (sum:any, product:any) => sum + ((product?.productAddedFromStock === 'yes' ? product?.actualPrice : product.price) * product.quantity || 0),
    0
  ).toLocaleString('en-IN');
  
  const totalGst = billData?.selectedProducts
    .reduce((sum:any, product:any) => sum + (product.gstAmount || 0), 0)
    .toFixed(2).toLocaleString('en-IN');
  
  // console.log("Total Price:", totalPrice); // Expected: 82.1
  // console.log("Total GST:", totalGst);     // Expected: 2.10

  
  useEffect(() => {
    if (billPageData && billData) {
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
  }, [billPageData , billData]);
  

  return (
<>
<div id="printArea" className={`h-full p-4 border rounded-md shadow-md bg-white font-OpenSans  ${billPageData?.printSize}`}>
    <div className="grid grid-cols-3 gap-3">
            <p className="text-xl font-bold ">Invoice</p>
            {billPageData?.invoiceFields?.showInvoiceNo ? (
              <p className="text-sm text-center">Bill No: <span className="text-base font-semibold">{billData?.billNo}</span></p>
            ) : (<p></p>)}

            <p className="text-[12px] text-end">Date & Time: <span className="font-medium">{isFormatDate(billData?.dateTime)}</span><span className="text-[10px] ms-1">{isFormatTime(billData?.dateTime)}</span></p>
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
              <p className="max-w-md mt-4 text-2xl font-bold text-center font-Poppins">{billPageData?.header?.businessName}</p>
            )}
            {billPageData?.header?.address && (
              <p className="flex flex-wrap w-full !max-w-md mt-2 font-medium text-center font-Poppins justify-center">{billPageData?.header?.address}</p>
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
              <tr >
                <td className="p-2 border">{index+ 1}</td>
                <td className="p-2 border">{item?.name}</td>
                <td className="p-2 border">₹ {(item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price).toLocaleString('en-IN')}</td>
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
                <p className="flex max-w-sm text-sm font-semibold text-center capitalize">{billPageData?.footer?.terms}</p>
              )}
            </div>
            <div>
              {billPageData?.footer?.signature && (
                <img src={billPageData?.footer?.signature} className="object-cover h-20 border rounded w-36" alt="" />
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-center">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
    </div>

    {( getBillPageData?.isLoading || getBillPageData?.isFetching || getProfileData.isLoading) && <LoaderScreen/>}
</>
  );
};

export default BillComponent;