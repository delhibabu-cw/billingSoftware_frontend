import { useState } from "react"
import ClientProfileUpdateModal from "./ClientProfileUpdateModal"
import { useQuery } from "@tanstack/react-query"
import { getProfileApi } from "../../../api-service/authApi"
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io"
import { deleteClientUserApi, deleteSubRoleApi, getClientUserApi, getSubRoleApi } from "../../../api-service/client"
import { MdDelete } from "react-icons/md"
import CreateSubRoleModal from "./CreateSubRoleModal"
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen"
import toast from "react-hot-toast"
import CreateUsersModal from "./CreateUsersModal"
import { formatByDate } from "../../../utils/helper"

const ClientProfile = () => {

    const [loading , setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [subRoleSearch, setSubRoleSearch] = useState('');
    const [clientUserSearch, setClientUserSearch] = useState('');
    const [openSubRoleModal , setOpenSubRoleModal] = useState(false)
    const [openSubRoleModalId , setOpenSubRoleModalId] = useState('')
    const [openUsersModal , setOpenUsersModal] = useState(false)
    const [openUsersModalId , setOpenUsersModalId] = useState('')

    const getProfileData = useQuery({
        queryKey: ['getProfileData'],
        queryFn: () => getProfileApi()
    })

    const profileData = getProfileData.data?.data?.result;

    const getSubRoleData = useQuery({
        queryKey: ['getSubRoleData', subRoleSearch],
        queryFn: () => getSubRoleApi(`?search=${subRoleSearch}`)
    })

    const subRoleData = getSubRoleData.data?.data?.result || [];

    const getClientUsersData = useQuery({
        queryKey: ['getClientUsersData', clientUserSearch],
        queryFn: () => getClientUserApi(`?search=${clientUserSearch}`)
    })

    const clientUsersData = getClientUsersData.data?.data?.result || [];


    const handleSubRoleDelete = async (id  :any)=>{
        try{
            setLoading(true)
            const deleteApi = await deleteSubRoleApi(id)
            if(deleteApi?.status === 200){
                toast.success(deleteApi?.data.msg)
                getSubRoleData.refetch()
            }
        }catch(err){
            console.log(err)            
        }finally{
            setLoading(false)
        }
    }
    
    const handleClientUserDelete = async (id  :any)=>{
        try{
            setLoading(true)
            const deleteApi = await deleteClientUserApi(id)
            if(deleteApi?.status === 200){
                toast.success(deleteApi?.data.msg)
                getSubRoleData.refetch()
                getClientUsersData.refetch()
            }
        }catch(err){
            console.log(err)            
        }finally{
            setLoading(false)
        }
    }

    return (
        <>
            <div className='relative pt-24 lg:pt-32 px-[4%] pb-10'>
                <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
                <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>

                <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-white">Profile</p>
                    <button
                        onClick={() => setOpenModal(true)}
                        className="flex items-center justify-center w-8 h-8 text-xl border rounded-md bg-primaryColor"><FaEdit /></button>
                </div>

                <div className="grid items-center grid-cols-12 gap-5 p-3 mt-5 md:p-4 rounded-3xl bg-white/15 backdrop-blur-md">
                    <div className="object-cover col-span-12 mx-auto overflow-hidden border rounded-full lg:col-span-3">
                        {profileData?.img_url ? (
                            <img src={profileData?.img_url} className="object-cover w-60 h-60 lg:w-56 lg:h-56 xl:w-60 xl:h-60" alt="" />
                        ) : (
                            <div className=" w-60 h-60 lg:w-56 lg:h-56 xl:w-60 xl:h-60">
                                  <FaUserCircle  className="w-full h-full text-primaryColor/90"/>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-between w-full col-span-12 gap-3 md:gap-5 md:flex-row lg:col-span-9">
                        <div className="flex flex-col w-full gap-3">
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 text-white/85">
                                    <p>Name</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-semibold">{profileData?.fullName}</p>
                            </div>
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 text-white/85">
                                    <p>Email</p>
                                    <p>:</p>
                                </div>
                                <p className="flex flex-wrap text-lg font-medium">{profileData?.email}</p>
                            </div>
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 text-white/85">
                                    <p>Mobile</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-medium">{profileData?.mobile}</p>
                            </div>
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 text-white/85">
                                    <p>GST %</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-medium">{profileData?.gstPercentage}</p>
                            </div>
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 text-white/85">
                                    <p>OverAll GST</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-medium">{profileData?.overAllGstToggle === 'on' ? 'Yes' : "No"}</p>
                            </div>
                        </div>
                        <div className="hidden border border-white/60 md:block"></div>
                        <div className="flex flex-col w-full gap-3">
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 xl:max-w-36 text-white/85">
                                    <p>Customer Details</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-semibold">{profileData?.customerToggle === 'on' ? 'Yes' : "No"}</p>
                            </div>
                            <div className="flex items-center w-full gap-3 text-white">
                                <div className="flex justify-between w-full max-w-36 xl:max-w-36 text-white/85">
                                    <p>Employee Details</p>
                                    <p>:</p>
                                </div>
                                <p className="text-lg font-semibold">{profileData?.employeeToggle === 'on' ? 'Yes' : "No"}</p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="flex flex-col gap-3 px-5 py-4 mt-5 rounded-3xl bg-white/15 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between w-full gap-3 md:flex-nowrap">
                        <p className="text-lg text-white">Add SubRole</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="search"
                                onChange={(e) => setSubRoleSearch(e.target.value)}
                                placeholder="Search SubRole Here..."
                                className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                            />
                            <div 
                             onClick={() => {setOpenSubRoleModal(true),setOpenSubRoleModalId('')}}
                            className="flex items-center justify-center w-10 h-8 text-xl border rounded-md cursor-auto bg-primaryColor">
                            <button
                               
                                className=""><IoMdAdd /></button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {subRoleData?.length > 0 ? (
                            <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                                    <thead className="text-white/80 bg-white/15">
                                        <tr className="">
                                            <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Name</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Description</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">UserCounts</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Status</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                                        </tr>
                                    </thead>
                                    <tbody className="">

                                        {subRoleData?.map((idx: any, index: number) => (
                                            <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                                                <td className="p-3 text-white/80">{index + 1}.</td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">{idx?.name ? idx?.name : "-"}</p>
                                                </td>
                                                <td className="flex flex-wrap p-3 max-w-40 2xl:max-w-44">
                                                    <div className="text-white capitalize">{idx?.description ? idx?.description : "-"}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white ">{idx?.userCount}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white capitalize">{idx?.status ? idx?.status : "-"}</div>
                                                </td>
                                                <td className="flex gap-2 p-3">
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                                                    onClick={() => { setOpenSubRoleModal(true), setOpenSubRoleModalId(idx?._id) }}
                                                    >
                                                        <FaEdit className="" />
                                                    </button>
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 border rounded-md border-primaryColor bg-white/10 text-primaryColor hover:bg-primaryColor hover:text-black"
                                                    onClick={() =>handleSubRoleDelete(idx?._id)}
                                                    >
                                                        <MdDelete className="" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}



                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mx-auto mt-2 text-center text-white/90">
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3 px-5 py-4 mt-5 rounded-3xl bg-white/15 backdrop-blur-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 md:flex-nowrap">
                        <p className="text-lg text-white">Add Users</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="search"
                                onChange={(e) => setClientUserSearch(e.target.value)}
                                placeholder="Search Users Here..."
                                className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                            />
                            <div className="flex items-center justify-center w-10 h-8 text-xl border rounded-md bg-primaryColor">
                            <button
                                onClick={() => {setOpenUsersModal(true),setOpenUsersModalId('')}}
                                className=""><IoMdAdd /></button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {clientUsersData?.length > 0 ? (
                            <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                                    <thead className="text-white/80 bg-white/15">
                                        <tr className="">
                                            <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">User Id</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Name</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Mobile</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">DOB</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Role</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Status</td>
                                            <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                                        </tr>
                                    </thead>
                                    <tbody className="">

                                        {clientUsersData?.map((idx: any, index: number) => (
                                            <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                                                <td className="p-3 text-white/80">{index + 1}.</td>
                                                <td className="p-3">
                                                    <p className="text-white ">{idx?.unquieId ? idx?.unquieId : "-"}</p>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-semibold text-white">{idx?.fullName ? idx?.fullName : "-"}</p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white">{idx?.mobile ? idx?.mobile : "-"}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white ">{idx?.dob ? formatByDate(idx?.dob) : "-"}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white ">{idx?.subRole?.name ? idx?.subRole?.name : "-"}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-white capitalize">{idx?.status ? idx?.status : "-"}</div>
                                                </td>
                                                <td className="flex gap-2 p-3">
                                                    {/* <button
                                                        className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                                                    // onClick={() => { setOpenModal(true), setOpenModalId(idx?._id) }}
                                                    >
                                                        <FaEye className="" />
                                                    </button> */}
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                                                        onClick={() => {setOpenUsersModal(true),setOpenUsersModalId(idx?._id)}}
                                                    >
                                                        <FaEdit className="" />
                                                    </button>
                                                    <button
                                                        className="flex items-center justify-center w-8 h-8 border rounded-md border-primaryColor bg-white/10 text-primaryColor hover:bg-primaryColor hover:text-black"
                                                    onClick={() =>handleClientUserDelete(idx?._id)}
                                                    >
                                                        <MdDelete className="" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}



                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mx-auto mt-2 text-center text-white/90">
                                <p>No Data Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {openModal && (
                <ClientProfileUpdateModal openModal={openModal} handleClose={() => setOpenModal(!openModal)} refetch={() => getProfileData.refetch()} />
            )}
            
            {openSubRoleModal && (
                <CreateSubRoleModal openModal={openSubRoleModal} handleClose={() => setOpenSubRoleModal(!openSubRoleModal)}
                modalId={openSubRoleModalId} refetch={() => getSubRoleData.refetch()} />
            )}
            
            {openUsersModal && (
                <CreateUsersModal openModal={openUsersModal} handleClose={() => setOpenUsersModal(!openUsersModal)}
                modalId={openUsersModalId} userRefetch={() => getClientUsersData.refetch()} subRoleRefetch={() => getSubRoleData.refetch()}/>
            )}

            {(loading || getSubRoleData?.isLoading || getSubRoleData.isFetching || getClientUsersData.isLoading || getClientUsersData.isFetching) && <LoaderScreen/>}
        </>

    )
}

export default ClientProfile