import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { useEffect, useState } from "react";
import { getProfileApi } from "../../../api-service/authApi";
import { getErrorMessage } from "../../../utils/helper";
import toast from "react-hot-toast";
import { getSubRoleApi, postSubRoleApi, putSubRoleApi } from "../../../api-service/client";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";

const CreateSubRoleModal = ({ openModal, handleClose, modalId, refetch }: any) => {

    if (!openModal) return null;
    
    const [loading, setLoading] = useState(false)
    
        const getProfileData = useQuery({
            queryKey: ['getProfileData'],
            queryFn: () => getProfileApi()
        })
    
        const profileData = getProfileData.data?.data?.result;

        const getSubRoleData = useQuery({
                queryKey: ['getSubRoleData', modalId],
                queryFn: () => getSubRoleApi(`/${modalId}`),
                enabled: !!modalId
            })
        
            const subRoleData = getSubRoleData.data?.data?.result

    const schema = yup.object({
        name: yup.string().required('This Field is Required.'),
        description: yup.string().optional(),
      });

      const { register, handleSubmit, setValue, formState: { errors } } = useForm({
              resolver: yupResolver(schema),
          });
      
          useEffect(() => {
              if (subRoleData) {
                  setValue("name", subRoleData?.name);
                  setValue("description", subRoleData?.description);
              }
          }, [subRoleData, setValue]);


             const onSubmit = async (data: any) => {
                  try {
                      setLoading(true);
                      const payload = {
                        name : data?.name,
                        description : data?.description,
                        clientId : profileData?._id
                      }
          
                      if (!modalId) {
                          const postApi = await postSubRoleApi(payload);
                          if (postApi?.status === 200) {
                              toast.success(postApi?.data?.msg);
                              handleClose();
                              refetch()
                          }
                      } else {
                          const putApi = await putSubRoleApi(payload, modalId);
                          if (putApi?.status === 200) {
                              toast.success(putApi?.data?.msg);
                              handleClose();
                              refetch()
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
        <h2 className="text-lg font-semibold text-white font-Montserrat">{modalId ? "Update" : "Create"} SubRole</h2>
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
                                          {...register('name')}
                                      />
                                      {errors.name && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.name)}</p>}
                                  </div>
                                  <div className="col-span-12 md:col-span-6">
                                      <p className="mb-1 text-white/80 font-OpenSans">Description </p>
                                      <input type="text"
                                          placeholder="Enter Description"
                                          className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                                          {...register('description')}
                                      />
                                      {errors.description && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.description)}</p>}
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
    {(loading || getSubRoleData?.isLoading || getSubRoleData.isFetching) && <LoaderScreen/>}
    </>
  )
}

export default CreateSubRoleModal