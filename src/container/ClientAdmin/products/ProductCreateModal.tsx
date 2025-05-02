import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import { useEffect, useState } from "react";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { getProductApi, getProductCategoryApi, postProductApi, putProductApi, singleUploadApi } from "../../../api-service/client";
import { BiUpload, BiXCircle } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import DocumentViewer from "../../../components/documentViewer";
import { getProfileApi } from "../../../api-service/authApi";
import toast from "react-hot-toast";

const ProductCreateModal = ({ openModal, handleClose, modalId, modalType, productRefetch, categoryRefetch, AllProductCountRefetch }: any) => {

    if (!openModal) return null;

    const getProfileData = useQuery({
        queryKey: ['getProfileData'],
        queryFn: () => getProfileApi()
    })

    const profileData = getProfileData?.data?.data?.result;

    const getProductData = useQuery({
        queryKey: ['getProductData', modalId,],
        queryFn: () => getProductApi(`/${modalId}`),
        enabled: modalType === 'update'
    })

    const productData = getProductData?.data?.data?.result

    const [loading, setLoading] = useState(false)
    const [documentItem, setDocumentItem] = useState({})
    const [documentModal, setDocumentModal] = useState(false)
    const [openGstpercentage, setOpenGstpercentage] = useState(false)

    const schema = yup.object({
        name: yup.string().required('This Field is Required.'),
        category: yup.string().required('This Field is Required.'),
        description: yup.string().optional(),
        img_url: yup.string().optional(),
        shortcutKey: yup.string().optional(),
        price: yup.string().required('This Field is Required.'),

        isgst: yup.string().oneOf(['true', 'false']).required('This Field is Required.'),

        // gstPercentage: yup.string().when('isgst', ([isgst], schema) => {
        //   return isgst === 'true' ? schema.required('GST Percentage is required.') : schema.optional();
        // }),

        // gstAmount: yup.string().optional(),
        gstAmount: yup.string().when('isgst', ([isgst], schema) => {
            return isgst === 'true' ? schema.required('GST Amount is required.') : schema.optional();
        }),

        // isgst: yup.boolean().required('This Field is Required.'),

        // gstPercentage: yup.string().when('isgst', ([isgst], schema) => {
        //     return isgst ? schema.required('GST Percentage is required.') : schema.optional();
        // }),

        // gstAmount: yup.string().when('isgst', ([isgst], schema) => {
        //     return isgst ? schema.required('GST Amount is required.') : schema.optional();
        // }),
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
        if (productData) {
            setValue('name', productData?.name)
            setValue('description', productData?.description)
            setValue('img_url', productData?.img_url)
            setValue('category', productData?.category?._id || '');
            setValue('price', productData?.price || '');
            setValue('shortcutKey', productData?.shortcutKey || '');
            // Convert boolean to string to match radio button values
            const isgstValue = productData?.isgst ? "true" : "false";
            setValue('isgst', isgstValue);

            if (isgstValue === "true") {
                setValue('gstAmount', productData?.gstAmount || 0);
            } else {
                setValue('gstAmount', '0'); // Reset if isgst is "false"
            }
        }
    }, [setValue, productData])

    useEffect(() => {
        if (modalType === 'create') {
            const isgstValue = profileData?.overAllGstToggle === 'on' ? "true" : "false";
            setValue('isgst', isgstValue);
            console.log(isgstValue, "for isGstValue toggle");
        }
    }, [setValue, profileData])



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
        if (watchIsGst === "true" && watchPrice && profileData?.gstPercentage) {
            const gstAmount = (
                (parseFloat(watchPrice) * parseFloat(profileData.gstPercentage)) / 100
            ).toFixed(2);

            console.log(gstAmount);

            // Ensure 0.00 is not treated as an empty string
            setValue('gstAmount', gstAmount === "0.00" ? "0.00" : gstAmount);
        } else {
            // If GST is not enabled, ensure gstAmount is cleared
            setValue('gstAmount', '0');
        }
    }, [watchIsGst, watchPrice, profileData?.gstPercentage, setValue]);


    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            let filteredData = { ...data };

            console.log(filteredData);

            const gstAmount = (
                (parseFloat(watchPrice) * parseFloat(profileData.gstPercentage)) / 100
            ).toFixed(2);

            // Assign the calculated GST amount to filteredData
            filteredData.gstAmount = gstAmount === '0.00' ? '0' : gstAmount;

            console.log(filteredData);

            if (modalType === 'create') {
                const postApi = await postProductApi(filteredData);
                if (postApi?.status === 200) {
                    toast.success(postApi?.data?.msg);
                    handleClose();
                    productRefetch();
                    categoryRefetch();
                    AllProductCountRefetch();
                }
            } else {
                const putApi = await putProductApi(filteredData, modalId);
                if (putApi?.status === 200) {
                    toast.success(putApi?.data?.msg);
                    handleClose();
                    productRefetch();
                    categoryRefetch();
                    AllProductCountRefetch();
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalType === 'create' ? "New" : "Update"} Product</h2>
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
                                <p className="mb-1 text-white/80 font-OpenSans">Product Name <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Product Name"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('name')}
                                />
                                {errors.name && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.name)}</p>}
                            </div>
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
                                <p className="mb-1 text-white/80 font-OpenSans">
                                    Category <span className="text-primaryColor">*</span>
                                </p>
                                <Controller
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={modalType === 'update'}
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
                                {profileData?.gstPercentage === '' && <p className='mt-1 text-xs font-medium text-primaryColor'>Please Add The GST Percentage In Profile</p>}
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
                                <p className="mb-1 text-white/80 font-OpenSans">Shortcut Key</p>
                                <input type="text"
                                    placeholder="Enter Shortcut Key"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('shortcutKey')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }}
                                />
                                {errors.shortcutKey && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.shortcutKey)}</p>}
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
                                                <p className="text-[#C5C5C5] font-Poppins">Upload Product Image</p>
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

            {(loading || getProductData.isFetching || getProductData.isLoading) && <LoaderScreen />}
            <DocumentViewer
                open={documentModal}
                handleModal={() => setDocumentModal(!documentModal)}
                document={documentItem}
            />
        </>
    )
}

export default ProductCreateModal