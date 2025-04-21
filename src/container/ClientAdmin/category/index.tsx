import { useQuery } from "@tanstack/react-query"
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen"
import NoDataFound from "../../../components/noDataFound"
import { useState } from "react"
import { IoMdAdd } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast"
import { deleteProductCategoryApi, getProductCategoryApi } from "../../../api-service/client"
import { BiEdit } from "react-icons/bi"
import CategoryCreateModal from "./CategoryCreateModal"
import NoImg from  "../../../assets/images/noDataFound/noImage.jpg"


const ClientCategory = () => {


    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [modalType, setModalType] = useState('')
    const [modalId, setModalId] = useState('')

    const getProductCategoryData = useQuery({
        queryKey: ['getProductCategoryData', search,],
        queryFn: () => getProductCategoryApi(`?search=${search}`),
    })

    const productCategoryData = getProductCategoryData?.data?.data?.result || []

    const handleDelete = async (id: any) => {
        try {
            setLoading(true)

            const deleteApi = await deleteProductCategoryApi(id)
            if (deleteApi?.status === 200) {
                toast.success(deleteApi?.data?.msg)
                getProductCategoryData.refetch()
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <div className='relative bg-[#1D2125] h-[100vh] pt-24 lg:pt-28 px-[4%]'>
                <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
                <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>


                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <input type="search"
                        placeholder="Search Here..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none" />

                    <div className="flex items-center max-w-md gap-3 md:max-w-full md:overflow-x-visible hide-scrollbar">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { setOpenModal(true), setModalType('create'), setModalId('') }}
                                className="px-3 py-2 flex  justify-center items-center gap-1 border-[1.5px] rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[#f1f6fd61] hover:border-primaryColor">
                                <IoMdAdd />Create
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {productCategoryData?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {productCategoryData?.map((idx: any, index: any) => (
                                <div className="flex justify-between gap-6 p-3  rounded-3xl bg-gradient-to-b from-[#222830] to-white/20 backdrop-blur-md" key={index}>
                                    <div className="flex gap-2">

                                        <img src={idx?.img_url ? idx?.img_url : NoImg} className="object-cover w-[70px] h-[70px] rounded-md shadow-xl" alt={NoImg} />
                                        <div >
                                            <p className="font-semibold text-white">{idx?.name?.length > 12 ? (idx?.name.slice(0, 12) + "..") : idx?.name}</p>

                                            <p className="flex flex-wrap mt-2 text-xs text-white/80">{idx?.description?.length > 40 ? (idx?.description.slice(0, 40) + "...") : idx?.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 h-fit">
                                        <button
                                            onClick={() => { setOpenModal(true), setModalType('update'), setModalId(idx?._id) }}
                                            className="p-1 flex h-7 w-7 text-lg  justify-center items-center gap-1 border-[1.5px] rounded-md border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black">
                                            <BiEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(idx?._id)}
                                            className="p-1 flex h-7 w-7 text-lg justify-center items-center gap-1 border-[1.5px] rounded-md border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black">
                                            <MdDeleteOutline />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoDataFound />
                    )}
                </div>
            </div>


            {(loading || getProductCategoryData?.isLoading || getProductCategoryData?.isFetching) && <LoaderScreen />}

            {openModal && <CategoryCreateModal openModal={openModal} handleClose={() => setOpenModal(!openModal)} modalId={modalId} modalType={modalType}
                refetch={() => getProductCategoryData?.refetch()} />}
        </>
    )
}

export default ClientCategory