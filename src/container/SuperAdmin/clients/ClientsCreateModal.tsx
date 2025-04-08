import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { decryptPassword, getErrorMessage } from "../../../utils/helper";
import { useEffect, useMemo, useState } from "react";
import { getClientApi, getRoleApi, postClientApi, putClientApi } from "../../../api-service/admin";
import toast from "react-hot-toast";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";

const ClientsCreateModal = ({ openModal, handleClose, refetch, modalId }: any) => {

    if (!openModal) return null;

    const [loading, setLoading] = useState(false)

    const getRoleData = useQuery({
        queryKey: ['getRoleData'],
        queryFn: () => getRoleApi(``)
    })

    const roleDropdown = getRoleData?.data?.data?.result?.map((item: any) => (
        { value: item?._id, label: item?.name }
    ))
    const roleData = getRoleData?.data?.data?.result?.find((item: any) => item?.name === 'CLIENTADMIN')?._id

    const validityDropdown: any = [
        { value: '1', label: '1 Year' },
        { value: '2', label: '2 Year' },
        { value: '3', label: '3 Year' },
        { value: '4', label: '4 Year' },
    ]

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
        role: yup.string().required('This Field is Required.'),
        location: yup.string().required('This Field is Required.'),
        brandName: yup.string().required('This Field is Required.'),
        validity: yup.number().required('This Field is Required.'),
        userName: yup.string().required('This Field is Required.'),
        password: yup
            .string()
            .required('This Field is Required.')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, *, ?, &).'
            ),
    })

    const { register, handleSubmit, setValue, formState: { errors }, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            role: roleData, // Set default role as CLIENTADMIN
        },
    });

    useEffect(() => {
        if (roleData) {
            setValue("role", roleData);
        }
    }, [roleData, setValue]);

    const getClientData = useQuery({
        queryKey: ['getClientData', modalId],
        queryFn: () => getClientApi(`/${modalId}`),
        enabled: !!modalId
    })

    const clientData = getClientData?.data?.data?.result

    const plainPassword = useMemo(() => {
        if (clientData?.password && clientData?.passwordIv) {
            const result = decryptPassword(clientData.password, clientData.passwordIv);
            // console.log('Decrypted password:', result);
            return result;
        }
        return '';
    }, [clientData?.password, clientData?.passwordIv]);

    useEffect(()=>{
        if(clientData){
            setValue('fullName', clientData?.fullName)
            setValue('email', clientData?.email)
            setValue('mobile', clientData?.mobile)
            setValue('role', clientData?.role?._id)
            setValue('location', clientData?.location)
            setValue('brandName', clientData?.brandName)
            setValue('validity', clientData?.validity)
            setValue('userName', clientData?.userName)
            setValue('password', plainPassword)
        }
    },[clientData])

    const onSubmit = async (data: any) => {
        try {
            setLoading(true)
            console.log(data);

           if(modalId){
            const putApi = await putClientApi(data, clientData?._id)
            if (putApi?.status === 200) {
                toast.success(putApi?.data?.msg)
                handleClose()
                refetch()
            }
           }else{
            const postApi = await postClientApi(data)
            if (postApi?.status === 200) {
                toast.success(postApi?.data?.msg)
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
                <div className="bg-white/20 backdrop-blur-lg  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalId ? 'Update' : 'New'} Client</h2>
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
                            <div className="col-span-12 md:col-span-6">
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
                            </div>

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
                                <p className="mb-1 text-white/80 font-OpenSans">Password <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Password"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('password')}
                                />
                                {errors.password && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.password)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Brand Name <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Brand Name"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('brandName')}
                                />
                                {errors.brandName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.brandName)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Location <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Location"
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('location')}
                                />
                                {errors.location && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.location)}</p>}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">
                                    Validity <span className="text-primaryColor">*</span>
                                </p>

                                <Controller
                                    control={control}
                                    name="validity"
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={modalId}
                                            className="rounded-md px-3 py-[9px] w-full bg-white/10 backdrop-blur-md outline-none border-[1.5px] border-white/40 text-white text-sm "
                                            onChange={(e) => field.onChange(e.target.value)}
                                        // value={field.value}
                                        >
                                            <option value="" disabled selected={!field.value}>
                                                Choose a Validity
                                            </option>
                                            {validityDropdown?.map((option: any) => (
                                                <option key={option.value} value={option.value} className="text-black">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                    )}
                                />

                                {errors.validity && (
                                    <p className="mt-1 text-xs font-medium text-primaryColor">
                                        {errors.validity.message}
                                    </p>
                                )}
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
        </>
    )
}

export default ClientsCreateModal