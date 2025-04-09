import { isFormatDate, isFormatTime } from "../../utils/helper";
import { useQuery } from "@tanstack/react-query";
import { getBillPageApi } from "../../api-service/client";
import { getProfileApi } from "../../api-service/authApi";
import { useEffect, useState } from "react";
import LoaderScreen from "../animation/loaderScreen/LoaderScreen";
import { MdAccessTime, MdDateRange } from "react-icons/md";

const BillComponent = ({ billData }: any) => {
  const [hasPrinted, setHasPrinted] = useState(false); // prevent double print on rerenders

  const { data: billPageResp, isLoading: isBillPageLoading } = useQuery({
    queryKey: ["getBillPageData"],
    queryFn: () => getBillPageApi(""),
    enabled: !!billData,
  });

  const billPageData = billPageResp?.data?.result;

  const { data: profileResp, isLoading: isProfileLoading } = useQuery({
    queryKey: ["getProfileData"],
    queryFn: getProfileApi,
  });

  const profileData = profileResp?.data?.result;

  const totalPrice = billData?.selectedProducts.reduce(
    (sum: any, product: any) =>
      sum +
      ((product?.productAddedFromStock === "yes"
        ? product?.actualPrice
        : product?.price) *
        product.quantity || 0),
    0
  ).toLocaleString("en-IN");

  const totalGst = billData?.selectedProducts
    .reduce((sum: any, product: any) => sum + (product.gstAmount || 0), 0)
    .toFixed(2)
    .toLocaleString("en-IN");

  const handlePrint = () => {
    const printContent = document.getElementById("printArea");
    const isMobile = window.innerWidth <= 768;

    if (!printContent) {
      console.warn("Print area not found");
      return;
    }

    if (isMobile) {
      const originalContent = document.body.innerHTML;
      const printHtml = `
        <html>
          <head>
            <title>Print Bill</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page { margin: 10px; }
              body { padding: 10px;  }
            </style>
          </head>
          <body>${printContent.innerHTML}</body>
        </html>
      `;
      document.body.innerHTML = printHtml;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Restore full app
    } else {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Print Bill</title>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { margin: 20px; }
                body { padding: 20px; background: white; }
              </style>
            </head>
            <body>
              <div id="printRoot">${printContent.innerHTML}</div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    setTimeout(() => window.close(), 300);
                  }, 500);
                }
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  // Trigger print only once when data is loaded
  useEffect(() => {
    if (billData && billPageData && !hasPrinted) {
      handlePrint();
      setHasPrinted(true);
    }
  }, [billData, billPageData, hasPrinted]);

  if (isBillPageLoading || isProfileLoading) return <LoaderScreen />;


  return (
    <div>
      <div
        id="printArea"
        className={`h-full p-4 border rounded-md shadow-md bg-white ${billPageData?.printSize} ${billPageData?.font}`}
      >
        <div className="grid grid-cols-3 gap-3">
          <p className="text-xl font-bold">Invoice</p>
          {billPageData?.invoiceFields?.showInvoiceNo ? (
            <p className="text-sm text-center">
              Bill No:{" "}
              <span className="text-base font-semibold">{billData?.billNo}</span>
            </p>
          ) : (
            <p></p>
          )}
          <p className="text-[12px] text-end">
            <span className="flex flex-wrap items-center justify-end gap-1">
              <span className="flex items-center gap-1">
                <MdDateRange className="text-lg" />
                {isFormatDate(billData?.dateTime)}
              </span>
              <span className="hidden md:block">|</span>
              <span className="flex items-center gap-1">
                <MdAccessTime className="text-lg" />
                {isFormatTime(billData?.dateTime)}
              </span>
            </span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 mt-3">
          {billPageData?.header?.logo?.logo_Url && (
            <img
              src={billPageData?.header?.logo?.logo_Url}
              className={`${
                billPageData?.header?.logo?.logoWidth || "w-36"
              } ${billPageData?.header?.logo?.logoHeight || "h-36"} ${
                billPageData?.header?.logo?.logoCircle ? "rounded-full" : "rounded"
              } ${billPageData?.header?.logoZoom ? "object-cover" : "object-fill"} shadow-lg`}
              alt=""
            />
          )}
          {billPageData?.header?.businessName && (
            <p className="max-w-md mt-4 text-2xl font-bold text-center">
              {billPageData?.header?.businessName}
            </p>
          )}
          {billPageData?.header?.address && (
            <p className="w-full max-w-md mt-2 font-medium text-center">
              {billPageData?.header?.address}
            </p>
          )}
        </div>

        <div className="flex justify-between mt-2">
          {billPageData?.invoiceFields?.showCustomer && (
            <div>
              <p className="text-lg font-medium">Customer Details</p>
              <p className="mt-1 text-sm">
                Name:{" "}
                <span className="font-medium capitalize">
                  {billData?.customer?.name || ""}
                </span>
              </p>
              <p className="text-sm">
                Mobile:{" "}
                <span className="font-medium">{billData?.customer?.mobile || ""}</span>
              </p>
            </div>
          )}
          {billPageData?.invoiceFields?.showEmployee && (
            <div>
              <p className="text-lg font-medium">Employee Details</p>
              <p className="mt-1 text-sm">
                Name:{" "}
                <span className="font-medium capitalize">
                  {billData?.employee?.fullName || ""}
                </span>
              </p>
              <p className="text-sm">
                ID:{" "}
                <span className="font-medium">{billData?.employee?.unquieId || ""}</span>
              </p>
            </div>
          )}
        </div>

        <hr className="mt-2 border border-dashed border-black/80" />
        <p className="py-1 text-xl font-semibold text-center">Cash Bill</p>
        <hr className="mb-2 border border-dashed border-black/80" />

        <table className="w-full mt-4 border border-collapse">
          <thead>
            <tr>
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
                <td className="p-2 border">
                  ₹{" "}
                  {(
                    item?.productAddedFromStock === "yes"
                      ? item?.actualPrice
                      : item?.price
                  ).toLocaleString("en-IN")}
                </td>
                <td className="p-2 border">{item?.quantity}</td>
                <td className="p-2 border">
                  ₹{" "}
                  {(
                    (item?.productAddedFromStock === "yes"
                      ? item?.actualPrice
                      : item?.price) * item?.quantity
                  ).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {profileData?.overAllGstToggle === "on" && (
              <>
                <tr>
                  <td className="p-2 text-sm font-medium border" colSpan={4}>
                    Sub Total
                  </td>
                  <td className="p-2 text-sm font-medium border">₹ {totalPrice}</td>
                </tr>
                <tr>
                  <td className="p-2 text-sm font-medium border" colSpan={4}>
                    GST ({profileData?.gstPercentage}%)
                  </td>
                  <td className="p-2 text-sm font-medium border">₹ {totalGst}</td>
                </tr>
              </>
            )}
            <tr>
              <td className="p-2 text-sm font-semibold border" colSpan={4}>
                Total
              </td>
              <td className="p-2 text-sm font-bold border">
                ₹ {Number(billData?.totalAmount).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="grid w-full grid-cols-2 gap-3 mt-3 md:grid-cols-3">
          <div className="hidden md:block" />
          {billPageData?.footer?.terms && (
            <div>
              <p className="text-xs font-semibold text-center capitalize md:text-sm">
                {billPageData?.footer?.terms}
              </p>
            </div>
          )}
          {billPageData?.footer?.signature && (
            <div>
              <img
                src={billPageData?.footer?.signature}
                className="object-cover w-20 ml-auto border rounded h-14 md:h-20 md:w-36"
                alt="signature"
              />
            </div>
          )}
        </div>

        <p className="mt-2 text-[11px] text-center">
          Billing Partner CORPWINGS IT SERVICE , 6380341944
        </p>
      </div>

      {/* Mobile Print Button */}
      {/* {isMobile && (
        <button
          onClick={handlePrint}
          className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Print Bill
        </button>
      )} */}
    </div>
  );
};

export default BillComponent;
