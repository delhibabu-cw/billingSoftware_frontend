import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getProductApi, putProductShortcutKeyApi } from '../../../api-service/client'
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import LoaderScreen from '../../../components/animation/loaderScreen/LoaderScreen';
import toast from 'react-hot-toast';

const CreateShortcutKeyModal = ({ openModal, handleClose, modalId, modalType, refetch }: any) => {

    if (!openModal) return null;

    const [loading, setLoading] = useState(false)

    const getProductData = useQuery({
        queryKey: ['getProductData', modalId,],
        queryFn: () => getProductApi(`/${modalId}`),
        enabled: !!modalId
    })

    const productData = getProductData?.data?.data?.result

    const getProductDropdownData = useQuery({
        queryKey: ['getProductDropdownData',],
        queryFn: () => getProductApi(``),
    })

const noShortcutKeyData = getProductDropdownData?.data?.data?.result?.filter((item:any) => modalType=== 'update' ? item?.shortcutKey : !item?.shortcutKey)

console.log(noShortcutKeyData,"noshort");

    const productDropdown = noShortcutKeyData?.map((item: any) => (
        { value: item?._id, label: item?.name }
    ))

    const schema = yup.object({
        shortcutKey: yup.string().required('This Field is Required.'),
        productId: yup.string().required('This Field is Required.'),
    })

    const { register, handleSubmit, setValue, formState: { errors }, control } = useForm({
        resolver: yupResolver(schema),
    });


    useEffect(() => {
        if (productData) {
            setValue('shortcutKey', productData?.shortcutKey)
            setValue('productId', productData?._id)
        }
    }, [setValue, productData])

    const onSubmit = async (data: any) => {
        try {
            setLoading(true)

            const payload = {
                shortcutKey: data?.shortcutKey
            }

            const putApi = await putProductShortcutKeyApi(payload, data?.productId)
            if (putApi.status === 200) {
                toast.success(putApi?.data?.msg)
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
                <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
                    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
                        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalType === 'create' ? "New" : "Update"} Product Shortcut Key</h2>
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
                                    Product <span className="text-primaryColor">*</span>
                                </p>
                                <Controller
                                    control={control}
                                    name="productId"
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={modalType === 'update'}
                                            className="rounded-md px-3 py-[9px] w-full bg-white/10 backdrop-blur-md outline-none border-[1.5px] border-white/40 text-white text-sm "
                                            onChange={(e) => field.onChange(e.target.value)}
                                        >
                                            <option value="" disabled selected={!field.value}>
                                                Choose a Product
                                            </option>
                                            {productDropdown?.map((option: any) => (
                                                <option key={option.value} value={option.value} className="text-black">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.productId && (
                                    <p className="mt-1 text-xs font-medium text-primaryColor">
                                        {errors.productId.message}
                                    </p>
                                )}
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <p className="mb-1 text-white/80 font-OpenSans">Shortcut Key <span className="text-primaryColor">*</span></p>
                                <input type="text"
                                    placeholder="Enter Shortcut Key"
                                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '') }}
                                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                    {...register('shortcutKey')}
                                />
                                {errors.shortcutKey && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.shortcutKey)}</p>}
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

            {(loading || getProductData.isFetching || getProductData.isLoading || getProductDropdownData.isLoading || getProductDropdownData.isFetching) && <LoaderScreen />}
        </>
    )
}

export default CreateShortcutKeyModal