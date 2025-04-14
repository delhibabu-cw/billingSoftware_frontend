import { useEffect, useState } from 'react'
import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage, isFormatDate, isFormatTime } from '../../../utils/helper';
import { getProfileApi } from '../../../api-service/authApi';
import { getStockApi, postStockApi } from '../../../api-service/client';
import toast from 'react-hot-toast';
import LoaderScreen from '../../../components/animation/loaderScreen/LoaderScreen';

const StockPurchaseCreateModal = ({ openModal, handleClose, stockType, refetch, modalId }: any) => {

    if (!openModal) return null;

    const [loading , setLoading] = useState(false)

        const getProfileData = useQuery({
            queryKey: ['getProfileData'],
            queryFn: () => getProfileApi()
        })
    
        const profileData = getProfileData?.data?.data?.result;

         const getStockData = useQuery({
            queryKey: ['getStockData',],
            queryFn: () => getStockApi(`/${modalId}`),
            enabled: !!modalId
          })

          const stockData = getStockData?.data?.data?.result

      const schema = yup.object({
            name: yup.string().required('This Field is Required.'),
            price: yup.number().required('This Field is Required.'),
            quantity: yup.string().required('This Field is Required.'),
            count: yup.number().required('This Field is Required.'),
            totalPrice: yup.number().required('This Field is Required.'),
            sellername: yup.string().optional(),
            sellerDetails: yup.string().optional(),
        });
    
    
        const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
            resolver: yupResolver(schema),
        });
    
        const watchcount = watch('count')
        const watchPrice = watch('price')
        
        console.log(errors);

        useEffect(()=>{
            if(watchPrice && watchcount){
                const totalPrice = watchPrice * watchcount
                setValue('totalPrice', totalPrice)
            }
        },[setValue, watchPrice, watchcount])

        const onSubmit = async (data : any)=>{
           try{
            setLoading(true)
            
            const payload = {
                clientId : profileData?._id,
                stockCategory : stockType,
                purchase : {
                    name : data?.name,
                    price : data?.price,
                    quantity : data?.quantity,
                    count : data?.count,
                    totalPrice : data?.totalPrice,
                    sellername : data?.sellername,
                    sellerDetails : data?.sellerDetails
                }
            }
            console.log(payload);
            const postApi =  await postStockApi(payload)
            if(postApi?.status === 200){
                toast.success(postApi?.data?.msg)
                handleClose()
                refetch()
            }
           }catch(err){
            console.log(err)            
           }finally{
            setLoading(false)
           }
        }


  return (
    <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-lg w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalId ? "Purchase Details" : "Add Purchase"}</h2>
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
                    </div>
                  {modalId ? (
                    <div className='flex flex-col gap-4 px-4 pt-4 pb-5'>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Name</p>
                                <p>:</p>
                            </div>
                            <p className='font-semibold text-white capitalize'>{stockData?.purchase?.name}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Quantity</p>
                                <p>:</p>
                            </div>
                            <p className='font-medium text-white capitalize'>{stockData?.purchase?.quantity}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Price</p>
                                <p>:</p>
                            </div>
                            <p className='font-semibold text-white capitalize'>₹ {Number(stockData?.purchase?.price).toLocaleString('en-In')}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Count</p>
                                <p>:</p>
                            </div>
                            <p className='font-medium text-white capitalize'>{stockData?.purchase?.count}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Total Price</p>
                                <p>:</p>
                            </div>
                            <p className='font-semibold text-white capitalize'>₹ {Number(stockData?.purchase?.totalPrice).toLocaleString('en-In')}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Seller Name</p>
                                <p>:</p>
                            </div>
                            <p className='font-medium text-white capitalize'>{stockData?.purchase?.sellername ? stockData?.purchase?.sellername : "-"}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Seller Details</p>
                                <p>:</p>
                            </div>
                            <p className='font-medium text-white capitalize'>{stockData?.purchase?.sellerDetails ? stockData?.purchase?.sellerDetails : "-"}</p>
                        </div>
                        <div className='flex gap-4 md:gap-6'>
                            <div className='flex justify-between w-32 md:w-48 text-white/80'>
                                <p>Date</p>
                                <p>:</p>
                            </div>
                            <p className='text-white capitalize '>{stockData?.createdAt ? <span>{isFormatDate(stockData?.createdAt)} <span className='text-sm ms-1'>{isFormatTime(stockData?.createdAt)}</span></span> : "-"}</p>
                        </div>
                    </div>
                  ) : (
                    <div className="h-full px-4 pt-4 pb-5 overflow-y-auto hide-scrollbar">
                    <form className="grid grid-cols-12 gap-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Name <span className="text-primaryColor">*</span></p>
                            <input type="text"
                                placeholder="Enter Name"
                                className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('name')}
                            />
                            {errors.name && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.name)}</p>}
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Quantity <span className="text-primaryColor">*</span></p>
                            <input type="text"
                                placeholder="Enter Quantity EX:kg,ml,pieces,units..."
                                className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('quantity')}
                            />
                            {errors.quantity && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.quantity)}</p>}
                        </div>
                        
                      
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Price <span className="text-primaryColor">*</span></p>
                            <input type="text"
                                placeholder="Enter Price"
                                className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('price')}
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                            />
                            {errors.price && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.price)}</p>}
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Count <span className="text-primaryColor">*</span></p>
                            <input type="text"
                                placeholder="Enter Count Ex: 10,50,100..."
                                className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('count')}
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                            />
                            {errors.count && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.count)}</p>}
                        </div>
                        {(watchPrice && watchcount) && (
                            <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Total Price <span className="text-primaryColor">*</span></p>
                            <input type="text"
                            disabled
                                placeholder="Enter Total Price"
                                className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('totalPrice')}
                                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                            />
                            {errors.totalPrice && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.totalPrice)}</p>}
                        </div>
                        )}
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Seller Name</p>
                            <input type="text"
                                placeholder="Enter Seller Name"
                                className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('sellername')}
                            />
                            {errors.sellername && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.sellername)}</p>}
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">Seller Details</p>
                            <input type="text"
                                placeholder="Enter Seller Details"
                                className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                {...register('sellerDetails')}
                            />
                            {errors.sellerDetails && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.sellerDetails)}</p>}
                        </div>
                        <div className="flex items-end justify-end col-span-12 mt-4">
                            <button type="submit" className="px-3 py-2 rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[1.5px] hover:border-primaryColor transform transition-all duration-200 ease-linear">
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
                  )}
    </div>
    </div>

    {(getStockData?.isLoading || getStockData.isFetching || loading) && <LoaderScreen/>}
    </>
  )
}

export default StockPurchaseCreateModal