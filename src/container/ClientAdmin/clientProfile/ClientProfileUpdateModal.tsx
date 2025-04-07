import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { getProfileApi } from "../../../api-service/authApi";
import { putClientProfileApi, singleUploadApi } from "../../../api-service/client";
import { BsEye } from "react-icons/bs";
import { BiUpload, BiXCircle } from "react-icons/bi";
import DocumentViewer from "../../../components/documentViewer";

const ClientProfileUpdateModal = ({ openModal, handleClose, refetch, }: any) => {

    if (!openModal) return null;

    const [loading, setLoading] = useState(false)
    const [documentItem, setDocumentItem] = useState({})
    const [documentModal, setDocumentModal] = useState(false)

    const getProfileData = useQuery({
        queryKey: ['getProfileData'],
        queryFn: () => getProfileApi()
    })

    const profileData = getProfileData.data?.data?.result;

    // const getRoleData = useQuery({
    //     queryKey: ['getRoleData'],
    //     queryFn: () => getRoleApi(``)
    // })

    // const roleDropdown = getRoleData?.data?.data?.result?.map((item: any) => (
    //     { value: item?._id, label: item?.name }
    // ))
    // const roleData = getRoleData?.data?.data?.result?.find((item: any) => item?.name === 'CLIENTADMIN')?._id
    // console.log(roleData);

    const schema = yup.object({
        fullName: yup.string().required('This Field is Required.'),
        email: yup.string().email().required('This Field is Required.'),
        mobile: yup
            .string()
            .required('Mobile number is required') // This ensures an empty input triggers the required message
            .test(
                'valid-mobile',
                'Mobile number must be 10 digits',
                (value) => !value || /^[6-9][0-9]{9}$/.test(value) // Only validate if value exists
            ),
        userName: yup.string().required('This Field is Required.'),
        gstPercentage: yup.string().required('This Field is Required.'),
        overAllGstToggle: yup.string().required('This Field is Required.'),
        customerToggle: yup.string().required('This Field is Required.'),
        employeeToggle: yup.string().required('This Field is Required.'),
        img_url: yup.string().optional(),
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
        if (profileData) {
            setValue("fullName", profileData?.fullName);
            setValue("email", profileData?.email);
            setValue("mobile", profileData?.mobile);
            setValue("userName", profileData?.userName);
            setValue("img_url", profileData?.img_url);
            setValue("gstPercentage", profileData?.gstPercentage);
            setValue('overAllGstToggle', profileData?.overAllGstToggle === 'on' ? "on" : "off");
            setValue('customerToggle', profileData?.customerToggle === 'on' ? "on" : "off");
            setValue('employeeToggle', profileData?.employeeToggle === 'on' ? "on" : "off");
        }
    }, [profileData, setValue]);


    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            console.log(data);

            const postApi = await putClientProfileApi(data, profileData?._id)
            if (postApi?.status === 200) {
                toast.success(postApi?.data?.msg)
                handleClose()
                refetch()
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
                <div className="bg-white/20 backdrop-blur-lg  rounded-lg max-w-sm md:max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">Update Profile</h2>
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
                                <p className="mb-1 text-white/80 font-OpenSans">Full Name <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Full Name"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('fullName')}
                                />
                                {errors.fullName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.fullName)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Mail ID <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Mail ID"
                                    className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('email')}
                                />
                                {errors.email && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.email)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Mobile <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Mobile Number"
                                    className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('mobile')}
                                    onInput={(e) => {
                                        const input = e.currentTarget.value;
                                        const cleanedInput = input.replace(/\D/g, '');
                                        if (/^[6-9][0-9]{0,9}$/.test(cleanedInput)) {
                                            e.currentTarget.value = cleanedInput;
                                        } else {
                                            e.currentTarget.value = cleanedInput.slice(0, -1);
                                        }
                                    }}
                                    maxLength={10}
                                />
                                {errors.mobile && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.mobile)}</p>}
                            </div>
                            {/* <div className="col-span-12 md:col-span-6">
                            <p className="mb-1 text-white/80 font-OpenSans">
                                Role
                            </p>

                            <Controller
                                control={control}
                                name="role"
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        disabled
                                        className="rounded-md px-3 py-[9px] w-full bg-white/10 backdrop-blur-md outline-none border-[1.5px] border-white/40 text-white text-sm "
                                        onChange={(e) => field.onChange(e.target.value)}
                                        value={field.value || roleData}
                                    >
                                        <option value="" disabled>
                                            Choose a Role
                                        </option>
                                        {roleDropdown?.map((option: any) => (
                                            <option key={option.value} value={option.value} className="text-black">
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                )}
                            />

                            {errors.role && (
                                <p className="mt-1 text-xs font-medium text-primaryColor">
                                    {errors.role.message}
                                </p>
                            )}
                        </div> */}
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">UserName <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter UserName"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('userName')}
                                />
                                {errors.userName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.userName)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">GST Percentage <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter GST Percentage"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('gstPercentage')}
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }}
                                />
                                {errors.gstPercentage && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.gstPercentage)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="gender" className="mb-1 text-white/80 font-OpenSans">Overall GST <span className='text-primaryColor'>*</span></label>
                                <div className="flex items-center mt-1">
                                    <div className="rounded-md px-2 py-[6px]  w-fit gap-2 flex bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white">
                                        <input
                                            className="cursor-pointer form-check-input"
                                            type="radio"
                                            //   name="gender"
                                            value="on"
                                            id="yes"
                                            {...register('overAllGstToggle')}
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
                                            value="off"
                                            id="no"
                                            {...register('overAllGstToggle')}
                                        />
                                        <label className="form-check-label" htmlFor="no">
                                            No
                                        </label>
                                    </div>
                                </div>
                                {errors?.overAllGstToggle && <p className='mt-1 text-xs font-medium text-primaryColor'>{getErrorMessage(errors?.overAllGstToggle)}</p>}
                                {profileData?.gstPercentage === '' && <p className='mt-1 text-xs font-medium text-primaryColor'>Please Add The GST Percentage In Profile</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="gender" className="mb-1 text-white/80 font-OpenSans">Customer Details<span className='text-primaryColor'>*</span></label>
                                <div className="flex items-center mt-1">
                                    <div className="rounded-md px-2 py-[6px]  w-fit gap-2 flex bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white">
                                        <input
                                            className="cursor-pointer form-check-input"
                                            type="radio"
                                            //   name="gender"
                                            value="on"
                                            id="yes"
                                            {...register('customerToggle')}
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
                                            value="off"
                                            id="no"
                                            {...register('customerToggle')}
                                        />
                                        <label className="form-check-label" htmlFor="no">
                                            No
                                        </label>
                                    </div>
                                </div>
                                {errors?.customerToggle && <p className='mt-1 text-xs font-medium text-primaryColor'>{getErrorMessage(errors?.customerToggle)}</p>}
                                {profileData?.gstPercentage === '' && <p className='mt-1 text-xs font-medium text-primaryColor'>Please Add The GST Percentage In Profile</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <label htmlFor="gender" className="mb-1 text-white/80 font-OpenSans">Employee Details<span className='text-primaryColor'>*</span></label>
                                <div className="flex items-center mt-1">
                                    <div className="rounded-md px-2 py-[6px]  w-fit gap-2 flex bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white">
                                        <input
                                            className="cursor-pointer form-check-input"
                                            type="radio"
                                            //   name="gender"
                                            value="on"
                                            id="yes"
                                            {...register('employeeToggle')}
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
                                            value="off"
                                            id="no"
                                            {...register('employeeToggle')}
                                        />
                                        <label className="form-check-label" htmlFor="no">
                                            No
                                        </label>
                                    </div>
                                </div>
                                {errors?.employeeToggle && <p className='mt-1 text-xs font-medium text-primaryColor'>{getErrorMessage(errors?.employeeToggle)}</p>}
                                {profileData?.gstPercentage === '' && <p className='mt-1 text-xs font-medium text-primaryColor'>Please Add The GST Percentage In Profile</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                                            <label htmlFor="contact-lead-score" className="mb-1 text-white/80 font-OpenSans">Profile Image</label>
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
                                                                                            title: 'Profile Image'
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
                                                                            <p className="text-[#C5C5C5] font-Poppins">Upload Profile Image</p>
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

            {loading && <LoaderScreen />}
            <DocumentViewer
                            open={documentModal}
                            handleModal={() => setDocumentModal(!documentModal)}
                            document={documentItem}
                        />
        </>
    )
}

export default ClientProfileUpdateModal