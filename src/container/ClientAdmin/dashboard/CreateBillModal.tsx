import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import {  useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage, getErrorMessageArray } from "../../../utils/helper";
import { useEffect, useState } from "react";
import { getProfileApi } from "../../../api-service/authApi";
import { getClientUserApi, getSubRoleApi, postCreateBillApi } from "../../../api-service/client";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import toast from "react-hot-toast";
import BillComponent from "../../../components/BillComponent";


const CreateBillModal = ({ openModal, handleClose, selectedProducts, totalAmount, clearSelectedProducts }: any) => {

  console.log('totalAmount',totalAmount);
  console.log('selected products',selectedProducts);
  const [billData, setBillData] = useState<any>(null);
  

  if (!openModal) return null;

  const [loading , setLoading] = useState(false)

  const getProfileData = useQuery({
    queryKey: ["getProfileData"],
    queryFn: () => getProfileApi(),
  });

  const profileData = getProfileData?.data?.data?.result;

  const schema = yup.object({

    customerToggle: yup.boolean(),
    employeeToggle: yup.boolean(),

    // customer: yup.object().shape({
    //   name: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
    //     customerToggle ? schema.required('Customer Name is required.') : schema.optional()
    //   ),
    //   mobile: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
    //     customerToggle ? schema.required('Customer Mobile is required.') : schema.optional()
    //   ),
    // }),

    customerName: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
      customerToggle ? schema.required('Customer Name is required.') : schema.optional()
    ),
    customerMobile: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
      customerToggle ? schema.required('Customer Mobile is required.').test(
        'valid-mobile',
        'Mobile number must be 10 digits',
        (value) => !value || /^[6-9][0-9]{9}$/.test(value) // Only validate if value exists
      ) : schema.optional()
    ),

    employee: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
      employeeToggle ? schema.required('Employee Name is required.') : schema.optional()
    ),
    userType: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
      employeeToggle ? schema.required('UserTpye is required.') : schema.optional()),

    // employee: yup.object().shape({
    //   name: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
    //     employeeToggle ? schema.required('Employee Name is required.') : schema.optional()
    //   ),
    //   mobile: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
    //     employeeToggle ? schema.required('Employee Mobile is required.') : schema.optional()
    //   ),
    // }),
  });


  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerToggle: false,
      employeeToggle: false,
      customerName: '',
      customerMobile: '',
      employee: '',
    }
  });

  console.log(errors);


  const watchUserType = watch('userType')
  const watchCustomerToggle = watch('customerToggle')
  const watchEmployeeToggle = watch('employeeToggle')
  const watchEmployee = watch('employee')

  useEffect(() => {
    if (profileData?.customerToggle === 'on') {
      setValue('customerToggle', true)
    } else {
      setValue('customerToggle', false)
    }
    if (profileData?.employeeToggle === 'on') {
      setValue('employeeToggle', true)
    } else {
      setValue('employeeToggle', false)
    }
  }, [profileData, setValue])

  const getSubRoleData = useQuery({
    queryKey: ['getSubRoleData'],
    queryFn: () => getSubRoleApi(``),
  })

  const subRoleDropdown = getSubRoleData.data?.data?.result?.map((item: any) => ({
    value: item?._id, label: item?.name
  }))

  const getClientUsersData = useQuery({
    queryKey: ['getClientUsersData', watchUserType],
    queryFn: () => getClientUserApi(`?subRole=${watchUserType ? watchUserType : ""}`),
    enabled: !!watchUserType
  })

  const clientUsersDropdown = getClientUsersData?.data?.data?.result?.map((item: any) => ({
    value: item?._id, label: item?.fullName, fullData: item
  }))


  const onSubmit = async (data: any) => {

    try {
      setLoading(true)

      const employeeDetails = getClientUsersData?.data?.data?.result?.find((idx: any) => idx?._id === watchEmployee)

      const payload = {
        totalAmount: totalAmount,
        selectedProducts: selectedProducts?.map((idx: any) => {
            // Calculate total and GST amount per product
            const gstAmountPerUnit = profileData?.overAllGstToggle === 'on' ? idx.gstAmount : 0;
            const totalGstAmount = gstAmountPerUnit * idx.quantitySelected; // GST for all units

            return {
                productId: idx?._id,
                quantity: idx?.quantitySelected,
                name: idx?.name,
                price: idx.price,
                actualPrice: idx?.actualPrice,
                profitMargin: idx?.profitMargin,
                gstAmount: totalGstAmount,  // Store total GST per product
                gstWithoutTotal: (idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) * idx.quantitySelected,
                gstWithTotal: profileData?.overAllGstToggle === 'on'
                    ? ((idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) + idx.gstAmount) * idx.quantitySelected
                    : (idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) * idx.quantitySelected,
                productAddedFromStock: idx?.productAddedFromStock
            }
        }),
        employee: data?.employee ? data?.employee : '',
        customer: {
          name: data?.customerName ? data?.customerName : '',
          mobile: data?.customerMobile ? data?.customerMobile : ''
        }
    };

      console.log(payload);
      const postApi = await postCreateBillApi(payload)
      if (postApi?.status === 200) {
        toast.success(postApi?.data?.msg)
        setBillData({
          billNo: postApi?.data?.result?.billNo || "N/A",
          dateTime: postApi?.data?.result?.createdAt,
          totalAmount: payload.totalAmount,
          selectedProducts: payload.selectedProducts,
          employee: employeeDetails,
          customer: payload.customer
      });
        // handleClose()
        clearSelectedProducts()
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
            <h2 className="text-lg font-semibold text-white font-Montserrat">Create Bill</h2>
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
              {watchEmployeeToggle && (
                <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg ">
                  <p className="text-white/80 ">Employee Details</p>
                  <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                    <div className="">
                      <p className="mb-1 text-white/80 font-OpenSans">
                        User Type <span className="text-primaryColor">*</span>
                      </p>
                      <div className="relative overflow-hidden">
                        <select
                          {...register("userType")}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose User Type</option>
                          {subRoleDropdown?.map((option: any) => (
                            <option key={option.value} value={option.value} className="bg-gray-400 text-white/80">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      {errors.userType && (
                        <p className="mt-1 text-xs font-medium text-primaryColor">
                          {getErrorMessageArray(errors.userType)}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <p className="mb-1 text-white/80 font-OpenSans">
                        User <span className="text-primaryColor">*</span>
                      </p>
                      <div className="relative overflow-hidden">
                        <select
                          {...register("employee")}
                          disabled={!watchUserType}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose User</option>
                          {clientUsersDropdown?.map((option: any) => (
                            <option key={option.value} value={option.value} className="bg-gray-400 text-white/80">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      {errors.employee && (
                        <p className="mt-1 text-xs font-medium text-primaryColor">
                          {getErrorMessageArray(errors.employee)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {
                watchCustomerToggle && (
                  <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg ">
                    <p className="text-white/80 ">Customer Details</p>
                    <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                      <div className="">
                        <p className="mb-1 text-white/80 font-OpenSans">Name <span className="text-primaryColor">*</span></p>
                        <input type="text"
                          placeholder="Enter Name"
                          className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                          {...register('customerName')}
                        />
                        {errors.customerName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.customerName)}</p>}
                      </div>
                      <div className="">
                        <p className="mb-1 text-white/80 font-OpenSans">Mobile <span className="text-primaryColor">*</span></p>
                        <input type="text"
                          placeholder="Enter Mobile Number"
                          className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                          {...register('customerMobile')}
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
                        {errors.customerMobile && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.customerMobile)}</p>}
                      </div>
                    </div>
                  </div>
                )
              }
              <div className="flex items-end justify-end col-span-12 mt-4">
                <button type="submit" className="px-3 py-2 rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[1.5px] hover:border-primaryColor transform transition-all duration-200 ease-linear">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      
                    
      {(loading || getSubRoleData.isLoading || getSubRoleData.isFetching || getClientUsersData.isLoading || getClientUsersData.isFetching) && <LoaderScreen />}

      <div className="!hidden">
            <BillComponent billData={billData} />
        </div>
    </>
  )
}

export default CreateBillModal