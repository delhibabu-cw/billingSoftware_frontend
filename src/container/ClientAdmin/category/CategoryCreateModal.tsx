import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { getProductCategoryApi, postProductCategoryApi, putProductCategoryApi, singleUploadApi } from "../../../api-service/client";
import { BiUpload, BiXCircle } from "react-icons/bi";
import { BsEye } from "react-icons/bs";
import DocumentViewer from "../../../components/documentViewer";

const CategoryCreateModal = ({ openModal, handleClose, refetch, modalId, modalType }: any) => {

    if (!openModal) return null;

    const getProductCategoryData = useQuery({
        queryKey: ['getProductCategoryData', modalId,],
        queryFn: () => getProductCategoryApi(`/${modalId}`),
        enabled: modalType === 'update'
    })

    const productCategoryData = getProductCategoryData?.data?.data?.result

    const [loading, setLoading] = useState(false)
    const [documentItem, setDocumentItem] = useState({})
    const [documentModal, setDocumentModal] = useState(false)

    const schema = yup.object({
        name: yup.string().required('This Field is Required.'),
        img_url: yup.string().optional(),
        description: yup.string().optional(),
    })

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const watchResume = watch('img_url')

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
        if (productCategoryData) {
            setValue('name', productCategoryData?.name)
            setValue('description', productCategoryData?.description)
            setValue('img_url', productCategoryData?.img_url)
        }
    }, [setValue, productCategoryData])


    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            console.log(data);

            if (modalType === 'create') {
                const postApi = await postProductCategoryApi(data)
                if (postApi?.status === 200) {
                    toast.success(postApi?.data?.msg)
                    handleClose()
                    refetch()
                }
            }else{
                const putApi = await putProductCategoryApi(data, modalId)
                if (putApi?.status === 200) {
                    toast.success(putApi?.data?.msg)
                    handleClose()
                    refetch()
                }
            }


        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }

    }

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalType === 'create' ? "New" : "Update"} Category</h2>
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
                                <p className="mb-1 text-white/80 font-OpenSans">Category Name <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Category Name"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('name')}
                                />
                                {errors.name && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.name)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Description</p>
                                <input type="text"
                                    placeholder="Enter Category Description"
                                    className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('description')}
                                />
                                {errors.description && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.description)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="contact-lead-score" className="mb-1 text-white/80 font-OpenSans">Category Image</label>
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
                                                                title: 'Category Image'
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

            {(loading || getProductCategoryData.isFetching || getProductCategoryData.isLoading) && <LoaderScreen />}
            <DocumentViewer
                open={documentModal}
                handleModal={() => setDocumentModal(!documentModal)}
                document={documentItem}
            />
        </>
    )
}

export default CategoryCreateModal