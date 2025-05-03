import { useQuery } from "@tanstack/react-query";
import { deleteProductShortcutKeyApi, getProductApi } from "../../../api-service/client";
import { useState } from "react";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import NoDataFound from "../../../components/noDataFound";
import CreateShortcutKeyModal from "./CreateShortcutKeyModal";
import toast from "react-hot-toast";



const ShortcutPage = () => {

    const [openModal , setOpenModal] = useState(false)
    const [modalId , setModalId] = useState('')
    const [modalType , setModalType] = useState('')
    const [loading , setLoading] = useState(false)

    const getProductData = useQuery({
        queryKey: ["getProductData"],
        queryFn: () => getProductApi(``),
    });

    const shorcutData = getProductData?.data?.data?.result?.filter((idx: any) => idx?.shortcutKey)

    console.log(shorcutData?.length);

    const handleDeleteShortcutKey = async (id :any) =>{
        try{
            setLoading(true)
            const deleteApi = await deleteProductShortcutKeyApi(id)
            if(deleteApi?.status === 200){
                toast.success(deleteApi?.data?.msg)
                getProductData.refetch()
            }
        }catch(err){
            console.log(err)            
        }finally{
            setLoading(false)
        }
    }

    return (
        <>
            <div className="h-full pt-28 lg:pt-32 px-[4%] pb-10">
                <div className="flex justify-between flex-wrap md:flex-nowrap gap-2 items-center">
                    <p className="text-white text-lg font-semibold">Shortcut Key Data</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setOpenModal(true), setModalType('create'), setModalId('') }}
                            className="px-3 py-2 flex  justify-center items-center gap-1 border-[1.5px] rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[#f1f6fd61] hover:border-primaryColor">
                            <IoMdAdd />Create
                        </button>
                    </div>
                </div>
                 <div className="mt-5">
                 {shorcutData?.length > 0 ? (
                                            <div className="block w-full mt-2 overflow-x-auto border border-white/30 rounded-xl hide-scrollbar">
                                                <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                                                    <thead className="text-white/80 bg-white/15">
                                                        <tr className="">
                                                            <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                                                            <td className="p-3 font-medium capitalize font-Montserrat">Product Id</td>
                                                            <td className="p-3 font-medium capitalize font-Montserrat">Name</td>
                                                            <td className="p-3 font-medium capitalize font-Montserrat">Shortcut Key</td>
                                                            <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="">
                
                                                        {shorcutData?.map((idx: any, index: number) => (
                                                            <tr key={index} className={"bg-white/15 border-t border-b border-white/5"}>
                                                                <td className="p-3 text-white/80">{index + 1}.</td>
                                                                <td className="p-3">
                                                                    <p className="font-medium text-white">{idx?.productId ? idx?.productId : "-"}</p>
                                                                </td>
                                                                <td className="p-3">
                                                                    <p className="font-semibold text-white">{idx?.name ? idx?.name : "-"}</p>
                                                                </td>
                                                                <td className="p-3">
                                                                    <div className="text-white ">{idx?.shortcutKey}</div>
                                                                </td>
                                                                <td className="flex gap-2 p-3">
                                                                    <button
                                                                        className="flex items-center justify-center w-8 h-8 border rounded-md bg-white/10 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                                                                    onClick={() => { setOpenModal(true), setModalType('update'), setModalId(idx?._id) }}
                                                                    >
                                                                        <FaEdit className="" />
                                                                    </button>
                                                                    <button
                                                                        className="flex items-center justify-center w-8 h-8 border rounded-md border-primaryColor bg-white/10 text-primaryColor hover:bg-primaryColor hover:text-black"
                                                                    onClick={() =>handleDeleteShortcutKey(idx?._id)}
                                                                    >
                                                                        <MdDelete className="" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                
                
                
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : <NoDataFound/>}
                 </div>
            </div>

            {openModal && <CreateShortcutKeyModal openModal={openModal} handleClose={()=>setOpenModal(!openModal)} modalId={modalId} modalType={modalType}
                refetch={()=>getProductData?.refetch()}/>}
            {(getProductData?.isLoading || getProductData.isFetching || loading) && (
                <LoaderScreen />
            )}
        </>
    );
};

export default ShortcutPage;
