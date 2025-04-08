import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getStockApi } from "../../../api-service/client";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { IoMdAdd } from "react-icons/io";
import { isFormatDate, isFormatTime, numberToWords } from "../../../utils/helper";
import { FaEye } from "react-icons/fa6";
import NoDataFound from "../../../components/noDataFound";
import StockProductCreateModal from "./StockProductCreateModal";
import { useNavigate } from "react-router-dom";
import StockPurchaseCreateModal from "./StockPurchaseCreateModal";
import DatePickerWithHighlights from "./stockCustomCalendar/ReactCustomCalendar";

const ClientStock = () => {

  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [stockEntry, setStockEntry] = useState<'products' | 'purchase'>('products');
  const [openModal, setOpenModal] = useState(false)
  const [stockType, setStockType] = useState('')
  const [purchaseModalId, setPurchaseModalId] = useState('')
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string | null>(stockEntry === 'products' ? "" : getCurrentDate());

  const [stockDates, setStockDates] = useState<{
    products: string[];
    purchase: string[];
  }>({
    products: [],
    purchase: [],
  });

  const getStockData = useQuery({
    queryKey: ['getStockData', search, selectedDate, stockEntry],
    queryFn: () => getStockApi(`?search=${search}&date=${selectedDate ? selectedDate : ''}&stockCategory=${stockEntry}`)
  })

  const stockData = getStockData?.data?.data?.result

  const totalPurchaseAmount = stockData?.reduce((pSum: any, idx: any) => pSum + (idx?.purchase?.totalPrice || 0), 0);
  const purchaseAmountWords = numberToWords(totalPurchaseAmount)

  // ✅ Fetch product & purchase highlight dates
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await getStockApi('');
        const result = res.data?.result || [];

        // Group and format dates per category
        const groupedDates = {
          products: [] as string[],
          purchase: [] as string[],
        };

        result.forEach((item: any) => {
          const category = item.stockCategory;
          const date = item.createdAt?.split('T')[0]; // format to YYYY-MM-DD

          if (category && date) {
            if (category === 'products') {
              groupedDates.products.push(date);
            } else if (category === 'purchase') {
              groupedDates.purchase.push(date);
            }
          }
        });

        setStockDates(groupedDates);
      } catch (err) {
        console.error('Error fetching highlight dates', err);
      }
    };

    fetchDates();
  }, []);



  useEffect(() => {
    if (stockEntry === 'products') {
      setSelectedDate("");
    } else if (stockEntry === 'purchase') {
      setSelectedDate(getCurrentDate());
    }
  }, []);

  return (
    <>
      <div className='relative pt-24 lg:pt-32 px-[4%] pb-10'>
        <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
        <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>
        <div className="flex flex-col gap-3 ">
          <div className="flex justify-between">
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => { setStockEntry('products'); setSelectedDate(null); }}
                className={`px-3 py-1 border rounded-3xl flex gap-2 ${stockEntry === 'products' ? "bg-primaryColor border-primaryColor" : "border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"}`}> <span>Stock Products</span></button>
              <button
                onClick={() => { setStockEntry('purchase'); setSelectedDate(getCurrentDate()); }}
                className={`px-3 py-1 border rounded-3xl flex gap-2 ${stockEntry === 'purchase' ? "bg-primaryColor border-primaryColor" : "border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"}`}> <span>Purchase</span></button>
            </div>
            <button
              onClick={() => { setOpenModal(true), setStockType(`${stockEntry}`), setPurchaseModalId('') }}
              className="px-3 py-2 flex h-fit  justify-center items-center gap-1 border-[1.5px] rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[#f1f6fd61] hover:border-primaryColor">
              <IoMdAdd />Create
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between w-full gap-3 md:flex-nowrap">
            <input
              type="search"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search BillNo Here..."
              className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
            />

            <div className="flex flex-wrap items-center gap-3">
              {stockEntry === 'products' && (
                <button
                  onClick={() => setSelectedDate("")}
                  className={`px-3 py-1 text-sm border rounded-md ${selectedDate === "" ? "bg-primaryColor text-black" : "text-primaryColor hover:bg-white/10"}`}>
                  Show All
                </button>
              )}
              <DatePickerWithHighlights
                stockEntry={stockEntry}
                stockDates={stockDates}
                selectedDate={selectedDate ?? undefined}
                onDateChange={(date: string | null) => {
                  if (date) setSelectedDate(date);
                }}
                showAllOption={stockEntry === 'products'} // ✅ Now recognized properly
              />
            </div>
          </div>
          <div>
            {stockEntry === 'products' &&
              (stockData?.length > 0 ? (
                <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                  <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                    <thead className="text-white/80 bg-white/15">
                      <tr className="">
                        <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Name</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Quantity</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Price</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">ProfitMargin</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Actual Price</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Stock</td>
                        {/* <td className="p-3 font-medium capitalize font-Montserrat">Total Amount</td> */}
                        <td className="p-3 font-medium capitalize font-Montserrat">Sales</td>
                        {!selectedDate && <td className="p-3 font-medium capitalize font-Montserrat">Date</td>}
                        <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                      </tr>
                    </thead>
                    <tbody className="">

                      {stockData?.map((idx: any, index: number) => (
                        <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                          <td className="p-3 text-white/80">{index + 1}.</td>
                          <td className="p-3">
                            <p className="font-semibold text-white capitalize">{idx?.products?.name ? idx?.products?.name : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white ">{idx?.products?.quantity ? idx?.products?.quantity : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white capitalize ">₹ {idx?.products?.price ? idx?.products?.price : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white capitalize ">₹ {idx?.products?.profitMargin ? idx?.products?.profitMargin : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white capitalize ">₹ {idx?.products?.actualPrice ? idx?.products?.actualPrice : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white capitalize ">{idx?.products?.count ? idx?.products?.count : "-"}</p>
                          </td>
                          {/* <td className="p-3">
                          <div className="text-white">₹ {(idx?.products?.actualPrice * idx?.products?.count).toLocaleString("en-IN")}</div>
                        </td> */}
                          <td className="p-3">
                            <p className="text-white capitalize ">{idx?.products?.sales}</p>
                          </td>
                          {!selectedDate && (
                            <td className="p-3">
                              <p className="text-white capitalize ">{idx?.createdAt ? <span>{isFormatDate(idx?.createdAt)}<span className="text-sm font-normal ms-1">{isFormatTime(idx?.createdAt)}</span></span> : "-"}</p>
                            </td>
                          )}
                          <td className="flex gap-2 p-3">
                            <button
                              className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                              onClick={() => navigate(`/stock/${idx?._id}`)}
                            >
                              <FaEye className="" />
                            </button>
                            {/* <button
                          title="Add Stock"
                            className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                          // onClick={() => { setOpenSubRoleModal(true), setOpenSubRoleModalId(idx?._id) }}
                          >
                            <MdAdd className="" />
                          </button> */}
                          </td>
                        </tr>
                      ))}



                    </tbody>
                    {/* <tfoot>
                    <tr className="border-t bg-white/20 border-white/30">
                      <td className="p-3 text-lg font-bold text-white" colSpan={7}>Total <span className="text-sm font-medium">({amountWords} Ruppess Only)</span></td>
                      <td className="p-3 text-lg font-bold text-white">₹ {totalAmount.toLocaleString("en-IN")}</td> 
                      <td className="p-3 text-lg font-bold text-white" colSpan={2}></td>
                    </tr>
                  </tfoot> */}
                  </table>
                </div>
              ) : <NoDataFound />)}

            {stockEntry === 'purchase' &&
              (stockData?.length > 0 ? (
                <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                  <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                    <thead className="text-white/80 bg-white/15">
                      <tr className="">
                        <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Name</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Quantity</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Price</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Count</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Total Price</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Date & Time</td>
                        <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                      </tr>
                    </thead>
                    <tbody className="">

                      {stockData?.map((idx: any, index: number) => (
                        <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                          <td className="p-3 text-white/80">{index + 1}.</td>
                          <td className="p-3">
                            <p className="font-semibold text-white">{idx?.purchase?.name ? idx?.purchase?.name : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white ">{idx?.purchase?.quantity ? idx?.purchase?.quantity : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white ">₹ {idx?.purchase?.price ? (idx?.purchase?.price).toLocaleString('en-IN') : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white ">{idx?.purchase?.count ? idx?.purchase?.count : "-"}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-white ">₹ {(idx?.purchase?.totalPrice).toLocaleString('en-IN')}</p>
                          </td>
                          <td className="p-3">
                            <div className="text-white capitalize"><span className='text-sm'>{isFormatDate(idx?.createdAt)}</span> <span className='text-xs text-white/80'>{isFormatTime(idx?.createdAt)}</span></div>
                          </td>
                          <td className="flex gap-2 p-3">
                            <button
                              className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                              onClick={() => { setOpenModal(true), setPurchaseModalId(idx?._id) }}
                            >
                              <FaEye className="" />
                            </button>
                          </td>
                        </tr>
                      ))}



                    </tbody>
                    <tfoot>
                      <tr className="border-t bg-white/20 border-white/30">
                        <td className="p-3 text-lg font-bold text-white" colSpan={5}>Total <span className="text-sm font-medium">({purchaseAmountWords} Ruppess Only)</span></td>
                        <td className="p-3 text-lg font-bold text-white">₹ {(totalPurchaseAmount).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-lg font-bold text-white" colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : <NoDataFound />)}
          </div>
        </div>
      </div>




      {(getStockData?.isLoading || getStockData?.isFetching) && <LoaderScreen />}

      {(openModal && stockEntry === 'products') && <StockProductCreateModal
        openModal={openModal} handleClose={() => setOpenModal(!openModal)} stockType={stockType} refetch={() => getStockData.refetch()} />}

      {(openModal && stockEntry === 'purchase') && <StockPurchaseCreateModal
        openModal={openModal} handleClose={() => setOpenModal(!openModal)} stockType={stockType} refetch={() => getStockData.refetch()} modalId={purchaseModalId} />}

    </>
  );
};

export default ClientStock;
