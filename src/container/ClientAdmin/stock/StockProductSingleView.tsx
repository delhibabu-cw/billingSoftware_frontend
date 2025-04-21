import { useQuery } from "@tanstack/react-query"
import { IoMdAdd } from "react-icons/io"
import { useNavigate, useParams } from "react-router-dom"
import { getStockApi, putProductStockApi } from "../../../api-service/client"
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen"
import { getErrorMessage, isFormatDate, isFormatTime, numberToWords } from "../../../utils/helper"
import { useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import toast from "react-hot-toast"
import NoImg from "../../../assets/images/noDataFound/noImage.jpg"

const StockProductSingleView = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const getStockData = useQuery({
        queryKey: ['getStockData',],
        queryFn: () => getStockApi(`/${id}`)
    })

    const stockData = getStockData?.data?.data?.result

    const totalStockAmount = stockData?.products?.countUpdates?.reduce((pSum: any, idx: any) => pSum + (idx?.totalAmount || 0), 0);
    const stockAmountWords = numberToWords(totalStockAmount)
    const totalSalesAmount = stockData?.products?.salesUpdates?.reduce((pSum: any, idx: any) => pSum + (idx?.totalAmount || 0), 0);
    const salesAmountWords = numberToWords(totalSalesAmount)

    const [openAddStock, setOpenAddStock] = useState(false)
    const [loading , setLoading] = useState(false)
    
    const schema = yup.object({
        additionalCount: yup.string().required('This Field is Required.'),
    });


    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data : any)=> {
        try{
            setLoading(true)
            
            const payload = {
                additionalCount : data?.additionalCount,
                product_Id : stockData?.products?._id
            }

            console.log(payload);
            
            const putApi  = await putProductStockApi(payload, stockData?._id)
            if(putApi?.status === 200){
                toast.success(putApi?.data?.msg)
                setOpenAddStock(false)
                getStockData?.refetch()
            }
        }
        catch(err){
            console.log(err)            
        }finally{
            setLoading(false)
        }
    }

    return (
        <>
            <div className='relative pt-24 lg:pt-32 px-[4%] pb-10'>
                <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
                <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>

                <div className="flex justify-between">
                    <div className="flex flex-wrap gap-2 px-3 py-2 mb-6 text-white border bg-white/10 rounded-3xl backdrop-blur-3xl border-primaryColor">
                        <p className="hover:cursor-pointer hover:text-primaryColor" onClick={() => navigate('/stock')}>Stock</p>
                        <p className="text-primaryColor">|</p>
                        <p className="">{stockData?.products?.name}</p>
                    </div>
                    <button
                        onClick={() => setOpenAddStock(true)}
                        className="px-3 py-2 flex h-fit  justify-center items-center gap-1 border-[1.5px] rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[#f1f6fd61] hover:border-primaryColor">
                        <IoMdAdd />Add Stock
                    </button>
                </div>
                <div className="p-3 md:p-4 bg-white/10 rounded-3xl">
                    <div className="flex flex-col gap-3 lg:gap-8 lg:flex-row ">
                        <img src={stockData?.products?.img_url ? stockData?.products?.img_url : NoImg} className="rounded-md w-28 h-28" alt="" />
                        <div className="flex flex-col justify-center gap-2">
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Name</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">{stockData?.products?.name}</p>
                            </div>
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Quantity</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">{stockData?.products?.quantity}</p>
                            </div>
                        </div>
                        <div className="border-t-[1px] border-white/30 lg:border-r-[1px]"></div>
                        <div className="flex flex-col justify-center gap-2">

                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Price</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">₹ {stockData?.products?.price}</p>
                            </div>
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>ProfitMargin</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">₹ {stockData?.products?.profitMargin}</p>
                            </div>
                        </div>


                        <div className="border-t-[1px] border-white/30 lg:border-r-[1px]"></div>
                        <div className="flex flex-col justify-center gap-2">
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Actual Price</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">₹ {stockData?.products?.actualPrice}</p>
                            </div>
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Stock</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">{stockData?.products?.count}</p>
                            </div>

                        </div>
                        <div className="border-t-[1px] border-white/30 lg:border-r-[1px]"></div>
                        <div className="flex flex-col justify-center gap-2">
                            <div className="flex gap-3 w-fit ">
                                <div className="flex justify-between xl:w-36 text-white/80">
                                    <p>Sales</p>
                                    <p>:</p>
                                </div>
                                <p className="text-white">{stockData?.products?.sales}</p>
                            </div>
                            {/* <div className="flex gap-2 w-fit ">
                            <div className="flex justify-between md:w-36 text-white/80">
                                <p>ProfitMargin</p>
                                <p>:</p>
                            </div>
                            <p className="text-white">₹ {stockData?.products?.profitMargin}</p>
                        </div> */}
                        </div>
                    </div>
                    <div>

                    </div>
                </div>

                <div className="flex flex-col gap-3 px-5 py-4 mt-5 rounded-3xl bg-white/15 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between w-full gap-3 md:flex-nowrap">
                        <p className="text-lg text-white">Stock Details</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="search"
                                // onChange={(e) => setSubRoleSearch(e.target.value)}
                                placeholder="Search Stock Details Here..."
                                className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        {stockData?.products?.countUpdates?.length > 0 ? (
                            <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                                    <thead className="text-white/80 bg-white/15">
                                        <tr className="">
                                        <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Count</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Price</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">ProfitMargin</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">ActualPrice</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">GST Amount</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Date</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Amount</td>
                                        </tr>
                                    </thead>
                                    <tbody className="">

                                        {stockData?.products?.countUpdates?.map((idx: any, index: number) => (
                                           <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                                           <td className="p-3 text-white/80">{index + 1}.</td>
                                           <td className="p-3">
                                               <p className="font-semibold text-white">{idx?.count}</p>
                                           </td>
                                           <td className="p-3">
                                               <p className="font-semibold text-white">₹ {idx?.price}</p>
                                           </td>
                                           <td className="p-3">
                                               <p className="font-semibold text-white">₹ {idx?.profitMargin}</p>
                                           </td>
                                           <td className="p-3">
                                               <p className="font-semibold text-white">₹ {idx?.actualPrice}</p>
                                           </td>
                                           <td className="p-3">
                                               <p className="font-semibold text-white">₹ {idx?.gstAmount ? idx?.gstAmount : 0}</p>
                                           </td>
                                           <td className="p-3">
                                               <div className="text-white capitalize"><span className='text-sm'>{isFormatDate(idx?.date)}</span> <span className='text-xs text-white/80'>{isFormatTime(idx?.date)}</span></div>
                                           </td>
                                           <td className="p-3">
                                               <div className="text-white capitalize">₹ {idx?.totalAmount ? (idx?.totalAmount).toLocaleString("en-IN") : "-"}</div>
                                           </td>
                                       </tr>
                                        ))}



                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t bg-white/20 border-white/30">
                                            <td className="p-3 text-lg font-bold text-white" colSpan={7}>Total <span className="text-sm font-medium">({stockAmountWords} Ruppess Only)</span></td>
                                            <td className="p-3 text-lg font-bold text-white">₹ {totalStockAmount.toLocaleString("en-IN")}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="mx-auto mt-2 text-center text-white/90">
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 px-5 py-4 mt-5 rounded-3xl bg-white/15 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between w-full gap-3 md:flex-nowrap">
                        <p className="text-lg text-white">Sales Details</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="search"
                                // onChange={(e) => setSubRoleSearch(e.target.value)}
                                placeholder="Search Sales Details Here..."
                                className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        {stockData?.products?.salesUpdates?.length > 0 ? (
                            <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                                    <thead className="text-white/80 bg-white/15">
                                        <tr className="">
                                            <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Count</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Price</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">ProfitMargin</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">ActualPrice</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">GST Amount</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Date</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Amount</td>
                                        </tr>
                                    </thead>
                                    <tbody className="">

                                        {stockData?.products?.salesUpdates?.map((idx: any, index: number) => (
                                            <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                                                <td className="p-3 text-white/80">{index + 1}.</td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">{idx?.count}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">₹ {idx?.price}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">₹ {idx?.profitMargin}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">₹ {idx?.actualPrice}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">₹ {idx?.gstAmount ? idx?.gstAmount : 0}</p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white capitalize"><span className='text-sm'>{isFormatDate(idx?.date)}</span> <span className='text-xs text-white/80'>{isFormatTime(idx?.date)}</span></div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white capitalize">₹ {idx?.totalAmount ? (idx?.totalAmount).toLocaleString("en-IN") : "-"}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t bg-white/20 border-white/30">
                                            <td className="p-3 text-lg font-bold text-white" colSpan={7}>Total <span className="text-sm font-medium">({salesAmountWords} Ruppess Only)</span></td>
                                            <td className="p-3 text-lg font-bold text-white">₹ {totalSalesAmount.toLocaleString("en-IN")}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="mx-auto mt-2 text-center text-white/90">
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {openAddStock && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                    <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                            <h2 className="text-lg font-semibold text-white font-Montserrat">Add product Stock</h2>
                            <button
                                type="button"
                                className="text-white/80 hover:text-primaryColor hover:scale-105"
                                onClick={() => setOpenAddStock(!openAddStock)}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form className="grid grid-cols-12 px-4 pt-4 pb-5" onSubmit={handleSubmit(onSubmit)}>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Count <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Product Count"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('additionalCount')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                                />
                                {errors.additionalCount && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.additionalCount)}</p>}
                            </div>
                            <div className="flex items-end justify-end col-span-12 mt-4">
                                <button type="submit" className="px-3 py-2 rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[1.5px] hover:border-primaryColor transform transition-all duration-200 ease-linear">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {(loading || getStockData?.isLoading || getStockData?.isFetching) && <LoaderScreen />}
        </>
    )
}

export default StockProductSingleView