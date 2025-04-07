import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { useEffect, useState } from "react";
import { formatYYMMDD, getErrorMessage, getErrorMessageArray } from "../../../utils/helper";
import toast from "react-hot-toast";
import { getClientUserApi, getSubRoleApi, postClientUserApi, putClientUserApi } from "../../../api-service/client";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";


const CreateUsersModal = ({ openModal, handleClose, modalId, userRefetch, subRoleRefetch }: any) => {

  if (!openModal) return null;

  const [loading, setLoading] = useState(false)

  // const getProfileData = useQuery({
  //   queryKey: ['getProfileData'],
  //   queryFn: () => getProfileApi()
  // })

  // const profileData = getProfileData.data?.data?.result;

  const getSubRoleData = useQuery({
    queryKey: ['getSubRoleData'],
    queryFn: () => getSubRoleApi(``),
  })

  const subRoleDropdown = getSubRoleData.data?.data?.result?.map((item: any) => ({
    value: item?._id, label: item?.name
  }))

     const getClientUserData = useQuery({
          queryKey: ['getClientUserData', modalId],
          queryFn: () => getClientUserApi(`/${modalId}`),
          enabled: !!modalId
      })
  
      const clientUserData = getClientUserData.data?.data?.result;

  const schema = yup.object({
    fullName: yup.string().required('This Field is Required.'),
    mobile: yup
      .string()
      .required('Mobile number is required') // This ensures an empty input triggers the required message
      .test(
        'valid-mobile',
        'Mobile number must be 10 digits',
        (value) => !value || /^[6-9][0-9]{9}$/.test(value) // Only validate if value exists
      ),
    subRole: yup.string().required('This Field is Required.'),
    dob: yup.string().optional(),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (clientUserData) {
        setValue("fullName", clientUserData?.fullName);
        setValue("mobile", clientUserData?.mobile);
        setValue("subRole", clientUserData?.subRole?._id);
        setValue("dob", clientUserData?.dob ? formatYYMMDD(clientUserData?.dob) : '');
    }
}, [clientUserData, setValue]);


  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      if (!modalId) {
        const postApi = await postClientUserApi(data);
        if (postApi?.status === 200) {
          toast.success(postApi?.data?.msg);
          handleClose();
          userRefetch()
           subRoleRefetch()
        }
      } else {
        const putApi = await putClientUserApi(data, modalId);
        if (putApi?.status === 200) {
          toast.success(putApi?.data?.msg);
          handleClose();
          userRefetch()
           subRoleRefetch()
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
            <h2 className="text-lg font-semibold text-white font-Montserrat">{modalId ? 'Update'  : "Create"} User</h2>
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
                <p className="mb-1 text-white/80 font-OpenSans">Name <span className="text-primaryColor">*</span></p>
                <input type="text"
                  placeholder="Enter Name"
                  className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                  {...register('fullName')}
                />
                {errors.fullName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.fullName)}</p>}
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
                  User Type <span className="text-primaryColor">*</span>
                </p>
                <div className="relative overflow-hidden">
                  <select
                    {...register("subRole")}
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
                {errors.subRole && (
                  <p className="mt-1 text-xs font-medium text-primaryColor">
                    {getErrorMessageArray(errors.subRole)}
                  </p>
                )}
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="mb-1 text-white/80 font-OpenSans">DOB</p>
                <input type="date" className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white" id="dob" placeholder="dob"
                  {...register(`dob`)}
                  max={new Date().toISOString().split('T')[0]} />
                {errors?.dob && <p className='mt-1 text-xs font-medium text-red-500'>{getErrorMessage(errors?.dob)}</p>}
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
      {(loading || getClientUserData.isLoading || getClientUserData.isFetching) && <LoaderScreen />}
    </>
  )
}

export default CreateUsersModal