import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import { useEffect, useState } from "react";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { getProductCategoryApi, getStockApi, postStockApi, putStockApi, singleUploadApi } from "../../../api-service/client";
import { BiUpload, BiXCircle } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import DocumentViewer from "../../../components/documentViewer";
import { getProfileApi } from "../../../api-service/authApi";
import toast from "react-hot-toast";

const StockProductCreateModal = ({ openModal, handleClose, stockType, refetch, modalId, modalType }: any) => {

    if (!openModal) return null;

    const getProfileData = useQuery({
        queryKey: ['getProfileData'],
        queryFn: () => getProfileApi()
    })

    const profileData = getProfileData?.data?.data?.result;

      const getStockData = useQuery({
        queryKey: ['getStockData', modalId],
        queryFn: () => getStockApi(`?product_Id=${modalId}`),
        enabled: modalType === 'update'
      })

      const stockData = getStockData?.data?.data?.result

    const [loading, setLoading] = useState(false)
    const [documentItem, setDocumentItem] = useState({})
    const [documentModal, setDocumentModal] = useState(false)
    const [openGstpercentage, setOpenGstpercentage] = useState(false)

    const schema = yup.object({
        name: yup.string().required('This Field is Required.'),
        category: yup.string().required('This Field is Required.'),
        description: yup.string().optional(),
        img_url: yup.string().optional(),
        price: yup.string().required('This Field is Required.'),
        actualPrice: yup.string().required('This Field is Required.'),
        quantity: yup.string().required('This Field is Required.'),
        count: yup.string().required('This Field is Required.'),
        profitMargin: yup.string().required('This Field is Required.'),

        isgst: yup.string().oneOf(['true', 'false']).required('This Field is Required.'),
        
        gstAmount: yup.string().when('isgst', ([isgst], schema) => {
            return isgst === 'true' ? schema.required('GST Amount is required.') : schema.optional();
        }),
    });


    const { register, handleSubmit, setValue, watch, formState: { errors }, control } = useForm({
        resolver: yupResolver(schema),
    });

    console.log(errors);


    const getProductCategoryData = useQuery({
        queryKey: ['getProductCategoryData',],
        queryFn: () => getProductCategoryApi(``),
    })

    const roleDropdown = getProductCategoryData?.data?.data?.result?.map((item: any) => (
        { value: item?._id, label: item?.name }
    ))

    const watchResume = watch('img_url')
    const watchPrice = watch('price')
    const watchProfitMargin = watch('profitMargin')
    const watchActualPrice = watch('actualPrice')
    const watchIsGst = watch('isgst');
    

    const handleSingleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Get the first selected file

        // Allowed file types
        const allowedFileTypes = [
            'image/jpeg', 'image/png', 'image/jpg', 'image/x-png',
            // 'application/pdf', 'application/vnd.ms-excel',
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            // 'application/vnd.ms-powerpoint', 'video/mp4', 'text/plain'
        ];

        // Validate file
        if (!file) return toast.error('No file selected.');
        if (!allowedFileTypes.includes(file.type)) return toast.error(`Invalid file type: ${file.type}`);
        if (file.size > 2 * 1024 * 1024) return toast.error('File size exceeds 2MB.');

        try {
            setLoading(true);

            // Prepare FormData
            const formData = new FormData();
            formData.append('file', file);

            // API Call
            const uploadData = await singleUploadApi(formData);

            // Handle API response
            if (uploadData?.data?.result?.location) {
                const uploadedFileURL = uploadData.data.result.location;
                setValue('img_url', uploadedFileURL); // Update form state
                toast.success(uploadData?.data?.msg || 'File uploaded successfully.');
            } else {
                throw new Error('Invalid API response');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            toast.error('File upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            const isgstValue = profileData?.overAllGstToggle === 'on' ? "true" : "false";
            setValue('isgst', isgstValue);
            console.log(isgstValue, "for isGstValue toggle");
    }, [setValue, profileData])

        useEffect(()=>{
            if(watchPrice && watchProfitMargin){
                const actualPrice = (parseFloat(watchPrice) + parseFloat(watchProfitMargin))
                setValue('actualPrice', String(actualPrice))
            }
        },[Number(watchPrice), watchProfitMargin, setValue])

    useEffect(() => {
        console.log("watchIsGst:", watchIsGst); // Debugging log

        if (watchIsGst === "false") {
            setValue("gstAmount", ""); // Reset GST Amount
        }

        // Convert string to boolean
        const isGstBoolean = watchIsGst === "true";

        setOpenGstpercentage(isGstBoolean);  // Directly set the boolean value
    }, [watchIsGst, setValue]);


    useEffect(() => {
        if (watchIsGst === "true" && watchActualPrice && profileData?.gstPercentage) {
            const gstAmount = (
                (parseFloat(watchActualPrice) * parseFloat(profileData.gstPercentage)) / 100
            ).toFixed(2);

            console.log(gstAmount);

            // Ensure 0.00 is not treated as an empty string
            setValue('gstAmount', gstAmount === "0.00" ? "0.00" : gstAmount);
        } else {
            // If GST is not enabled, ensure gstAmount is cleared
            setValue('gstAmount', '0');
        }
    }, [watchIsGst, watchActualPrice, profileData?.gstPercentage, setValue]);


    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            let payload = { 
                clientId : profileData?._id,
                stockCategory : stockType,
                products : {
                    name : data?.name,
                    clientId : profileData?._id,
                    price : Number(data?.price),
                    quantity : data?.quantity,
                    isgst : data?.isgst,
                    count : Number(data?.count),
                    gstAmount : data?.gstAmount,
                    category : data?.category,
                    description : data?.description,
                    profitMargin : Number(data?.profitMargin),
                    actualPrice : Number(data?.actualPrice),
                    img_url : data?.img_url
                }
             };

            console.log(payload);

            if(modalType === 'update'){
                const putApi =  await putStockApi(payload, stockData?._id)
                if(putApi?.status === 200){
                    toast.success(putApi?.data?.msg)
                    handleClose()
                    refetch()
                }
            }else{
                const postApi =  await postStockApi(payload)
            if(postApi?.status === 200){
                toast.success(postApi?.data?.msg)
                handleClose()
                refetch()
            }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(()=>{
        if(modalType === 'update'){
            setValue('category', stockData?.products?.category?._id)
            setValue('name', stockData?.products?.name)
            setValue('quantity', stockData?.products?.quantity)
            setValue('price', stockData?.products?.price)
            setValue('profitMargin', stockData?.products?.profitMargin)
            setValue('actualPrice', stockData?.products?.actualPrice)
            setValue('count', stockData?.products?.count)
            setValue('count', stockData?.products?.count)
            setValue('description', stockData?.products?.description)
            setValue('img_url', stockData?.products?.img_url)

            const isgstValue = stockData?.products?.isgst ? "true" : "false";
            setValue('isgst', isgstValue);

            if (isgstValue === "true") {
                setValue('gstAmount', stockData?.products?.gstAmount || 0);
            } else {
                setValue('gstAmount', '0'); // Reset if isgst is "false"
            }
        }
    },[setValue, stockData])

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalType === 'update' ? 'Update' : 'Add'} Product</h2>
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
                    <div className="h-full px-4 pt-4 pb-5 overflow-y-auto hide-scrollbar">
                        <form className="grid grid-cols-12 gap-4" onSubmit={handleSubmit(onSubmit)}>
                        <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">
                                    Category <span className="text-primaryColor">*</span>
                                </p>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="rounded-md px-3 py-[9px] w-full bg-white/10 backdrop-blur-md outline-none border-[1.5px] border-white/40 text-white text-sm "
                                            onChange={(e) => field.onChange(e.target.value)}
                                        >
                                            <option value="" disabled selected={!field.value}>
                                                Choose a Category
                                            </option>
                                            {roleDropdown?.map((option: any) => (
                                                <option key={option.value} value={option.value} className="text-black">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.category && (
                                    <p className="mt-1 text-xs font-medium text-primaryColor">
                                        {errors.category.message}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Product Name <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Product Name"
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
                                <p className="mb-1 text-white/80 font-OpenSans">Profit Margin <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Profit Margin"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('profitMargin')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/|\D/g, '') }}
                                />
                                {errors.profitMargin && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.profitMargin)}</p>}
                            </div>
                            {(watchPrice && watchProfitMargin) && (
                                <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Actual Price <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                disabled
                                    placeholder="Enter Actual Price"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('actualPrice')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                                />
                                {errors.actualPrice && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.actualPrice)}</p>}
                            </div>
                            )}
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Count <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Count Ex: 10,50,100..."
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('count')}
                                    disabled={modalType === 'update'}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                                />
                                {errors.count && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.count)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="gender" className="mb-1 text-white/80 font-OpenSans">Is GST <span className='text-primaryColor'>*</span></label>
                                <div className="flex items-center mt-1">
                                    <div className="rounded-md px-2 py-[6px]  w-fit gap-2 flex bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white">
                                        <input
                                            className="cursor-pointer form-check-input"
                                            type="radio"
                                            //   name="gender"
                                            value="true"
                                            id="yes"
                                            disabled={!watchPrice && profileData?.gstPercentage === ''}
                                            {...register('isgst')}
                                        />
                                        <label className="form-check-label" htmlFor="yes">
                                            Yes
                                        </label>
                                    </div>
                                    <div className="ml-3 rounded-md px-2 py-[6px]  w-fit gap-2 flex bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white">
                                        <input
                                            className="cursor-pointer form-check-input"
                                            type="radio"
                                            //   name="gender"
                                            value="false"
                                            id="no"
                                            disabled={!watchPrice && profileData?.gstPercentage === ''}
                                            {...register('isgst')}
                                        />
                                        <label className="form-check-label" htmlFor="no">
                                            No
                                        </label>
                                    </div>
                                </div>
                                {errors?.isgst && <p className='mt-1 text-xs font-medium text-primaryColor'>{getErrorMessage(errors?.isgst)}</p>}
                            </div>
                            {/* 
                            {openGstpercentage && (  // Only show if openGstpercentage is true
                                <div className="col-span-12 md:col-span-6">
                                    <p className="mb-1 text-white/80 font-OpenSans">GST Percentage</p>
                                    <input
                                        type="text"
                                        placeholder="Enter GST Percentage"
                                        className="rounded-md px-3 py-[6px] w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                        {...register('gstPercentage')}
                                        onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/^0|\D/g, '') }}
                                    />
                                    {errors.gstPercentage && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.gstPercentage)}</p>}
                                </div>
                            )} */}
                            {(openGstpercentage && watchPrice) && (
                                <div className="col-span-12 md:col-span-6">
                                    <p className="mb-1 text-white/80 font-OpenSans">GST Amount</p>
                                    <input
                                        type="text"
                                        placeholder="Enter GST Percentage"
                                        disabled
                                        className="rounded-md px-3 py-[6px] w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                        {...register('gstAmount')}
                                    />
                                    {errors.gstAmount && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.gstAmount)}</p>}
                                </div>
                            )}
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Description</p>
                                <input type="text"
                                    placeholder="Enter Product Description"
                                    className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('description')}
                                />
                                {errors.description && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.description)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="contact-lead-score" className="mb-1 text-white/80 font-OpenSans">Product Image</label>
                                <div className="min-h-fit border-dashed border-primaryColor border-[2px] !border-spacing-10 rounded-md flex justify-center items-center mt-2 py-6">
                                    {watchResume ? (
                                        <div className="flex flex-wrap justify-center gap-3 overflow-hidden">
                                            <div className="flex flex-col items-center gap-3">
                                                {/* Display file name */}
                                                {watchResume && (
                                                    <span
                                                        className="max-w-xs text-xs font-medium truncate text-white/70"
                                                        title={watchResume} // Show full file name on hover
                                                    >
                                                        {watchResume.split('/').pop()} {/* Extract only the file name */}
                                                    </span>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setDocumentItem({
                                                                val: watchResume,
                                                                key: watchResume?.endsWith('.pdf') ? 'document' : 'image',
                                                                title: 'Product Image'
                                                            });
                                                            setDocumentModal(true);
                                                        }}
                                                        type="button"
                                                        className="flex items-center justify-center gap-2 px-2 py-1 text-black rounded-md bg-primaryColor w-fit"
                                                    >
                                                        View <BsEye />
                                                    </button>
                                                    <BiXCircle
                                                        className="text-white cursor-pointer"
                                                        onClick={() => {
                                                            setValue('img_url', ''); // Clear the uploaded file
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    ) : (
                                        <div>
                                            <label className="flex flex-col items-center justify-center text-[#2B2B2D] cursor-pointer" htmlFor={`productImage`}>
                                                <BiUpload className="w-9 h-9 text-[#C5C5C5]" />
                                                <p className="text-[#C5C5C5] font-Poppins">Upload Category Image</p>
                                            </label>
                                            <input
                                                id={`productImage`}
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleSingleUploadImage(e)}
                                            />
                                        </div>
                                    )}
                                </div>
                                {errors.img_url && <p className="mt-3 text-xs font-medium text-primaryColor">{getErrorMessage(errors.img_url)}</p>}
                            </div>

                            <div className="flex items-end justify-end col-span-12 mt-4">
                                <button type="submit" className="px-3 py-2 rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[1.5px] hover:border-primaryColor transform transition-all duration-200 ease-linear">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {(loading || getProfileData.isFetching || getProfileData.isLoading) && <LoaderScreen />}
            
            <DocumentViewer
                open={documentModal}
                handleModal={() => setDocumentModal(!documentModal)}
                document={documentItem}
            />
        </>
    )
}

export default StockProductCreateModal