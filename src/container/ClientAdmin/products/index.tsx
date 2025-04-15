import { useQuery } from "@tanstack/react-query"
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen"
import NoDataFound from "../../../components/noDataFound"
import { useState } from "react"
import { IoMdAdd } from "react-icons/io";
import { MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast"
import { deleteProductApi, getProductApi, getProductCategoryApi, putClientProfileApi } from "../../../api-service/client"
import { BiEdit } from "react-icons/bi"
import ProductCreateModal from "./ProductCreateModal";
import { getProfileApi } from "../../../api-service/authApi";
import { useNavigate } from "react-router-dom";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";
import StockProductCreateModal from "../stock/StockProductCreateModal";


const ClientProducts = () => {

  const navigate = useNavigate()
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalId, setModalId] = useState('')
  const [categoryData, setCategoryData] = useState<string | any>('');  // ✅ Default to '' instead of {}
  const [openProductStockModal, setOpenProductStockModal] = useState(false)


  const getProfileData = useQuery({
    queryKey: ['getProfileData',],
    queryFn: () => getProfileApi(),
  })

  const profileData = getProfileData?.data?.data?.result;

  const getProductDataCounts = useQuery({
    queryKey: ['getProductDataCounts',],
    queryFn: () => getProductApi(``),
  })

  const productDataCounts = getProductDataCounts?.data?.data?.result || []

  const getProductCategoryData = useQuery({
    queryKey: ['getProductCategoryData',],
    queryFn: () => getProductCategoryApi(``),
  })

  const productCategoryData = getProductCategoryData?.data?.data?.result || []

  const getProductData = useQuery({
    queryKey: ['getProductData', search, categoryData?._id],
    queryFn: () => getProductApi(`?search=${search}&category=${categoryData?._id ? categoryData?._id : ""}`),
  })

  const productData = getProductData?.data?.data?.result || []

  const handleDelete = async (id: any, productName: String) => {
    try {
      setLoading(true)

      const deleteApi = await deleteProductApi(id, productName)
      if (deleteApi?.status === 200) {
        toast.success(deleteApi?.data?.msg)
        getProductData.refetch()
        getProductDataCounts.refetch()
        getProductCategoryData.refetch()
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  // const [showFullMessage, setShowFullMessage] = useState(false);
  // useEffect(() => {
  //   if (!profileData?.gstPercentage) {
  //     // Show message every 20 sec, then hide after 5 sec
  //     const interval = setInterval(() => {
  //       setShowFullMessage(true);
  //       setTimeout(() => setShowFullMessage(false), 5000); // Hide after 5 sec
  //     }, 10000); // Trigger every 20 sec

  //     return () => clearInterval(interval); // Cleanup on unmount
  //   }
  // }, [profileData]);


  const handleGstToggle = async (data: any) => {
    try {
      const payload = { overAllGstToggle: data }

      setLoading(true)

      const postApi = await putClientProfileApi(payload, profileData?._id)
      if (postApi?.status === 200) {
        toast.success(postApi?.data?.msg)
        getProfileData.refetch()
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }


  }


  return (
    <>
      <div className='relative   pt-24 lg:pt-32 px-[4%] pb-10'>
        <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
        <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>


        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <input type="search"
            placeholder="Search Here..."
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none" />

          <div className="flex items-center max-w-md gap-3 md:max-w-full md:overflow-x-visible hide-scrollbar">
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor cursor-pointer hover:bg-primaryColor hover:text-black"
                onClick={() => navigate('/profile')}>
                <div className="flex items-center">
                  <HiOutlineDocumentCurrencyRupee size={30} />
                  <p>GST %</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="">:</span>
                  <span className="text-lg font-bold">{profileData?.gstPercentage}</span>
                </div>
              </div>
              {/* {profileData?.gstPercentage ? (
                  <div></div>
              ) : (
                <div className="flex items-center px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                  <div className="flex items-center">
                    <HiOutlineDocumentCurrencyRupee size={30} />
                    <p>GST % is ?</p>
                  </div>
                  {showFullMessage && (
                    <motion.div
                      initial={{ x: -50, opacity: 0 }} // Start from left
                      animate={{ x: 0, opacity: 1 }}   // Move to right
                      transition={{ duration: 0.5, ease: "easeOut" }} // Smooth transition
                      className="ms-2"
                    >
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-1 underline"
                      >
                        <span>To Add</span> <TbHandClick size={20} />
                      </button>
                    </motion.div>
                  )}
                </div>)} */}

              {profileData?.gstPercentage === '' ? "" : (
                profileData?.overAllGstToggle === 'on' ? (
                  <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                    <span>GST</span>
                    <FaToggleOn size={30} onClick={() => handleGstToggle('off')} className="cursor-pointer" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                    <span>GST</span>
                    <FaToggleOff size={30} onClick={() => handleGstToggle('on')} className="cursor-pointer" />
                  </div>
                ))}
              <button
                onClick={() => { setOpenModal(true), setModalType('create'), setModalId('') }}
                className="px-3 py-2 flex  justify-center items-center gap-1 border-[1.5px] rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[#f1f6fd61] hover:border-primaryColor">
                <IoMdAdd />Create
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setCategoryData('')}
              className={`px-3 py-1 border rounded-3xl flex gap-2 ${categoryData === '' ? "bg-primaryColor border-primaryColor" : "border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"}`}> <span>All</span> ({productDataCounts?.length})</button>
            {productCategoryData?.map((idx: any, index: any) => (
              <button key={index}
                onClick={() => { setCategoryData(idx) }}
                className={`px-3 py-1 border rounded-3xl flex gap-2 ${categoryData?.name === `${idx?.name}` ? "bg-primaryColor border-primaryColor" : "border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"}`}><span>{idx?.name}</span> ({idx?.products})</button>
            ))}
          </div>
          {productData?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {productData?.map((idx: any, index: any) => (
                <div
                  className="flex justify-between gap-6 p-3 transition duration-300 border shadow-xl rounded-3xl bg-white/10 border-white/20 backdrop-blur-md hover:shadow-2xl hover:backdrop-blur-lg"
                  key={index}
                >
                  <div className="flex gap-2">

                    <img src={idx?.img_url} className="object-cover w-20 h-20 md:w-20 md:h-20 border-[1px] border-white/15 rounded-md shadow-xl" alt={idx?.name} />
                    <div >
                      <p className="font-semibold text-white">{idx?.name?.length > 16 ? (idx?.name.slice(0, 16) + "..") : idx?.name}</p>

                      {/* <p className="flex flex-wrap mt-2 text-xs text-white/80">{idx?.description?.length > 40 ? (idx?.description.slice(0, 40) + "...") : idx?.description}</p> */}
                      {idx?.productAddedFromStock === 'yes' && (
                        <div className="flex flex-wrap gap-[6px] mt-2">
                          <div className="flex items-center gap-1 px-2 py-1 bg-white border rounded-full border-white/50 w-fit">
                            <div className="flex text-xs text-black/90">
                              <p>Stock</p>
                              <p>:</p>
                            </div>
                            <p className=" flex gap-[2px] text-xs font-semibold">
                              {idx?.count}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-white border rounded-full border-white/50 w-fit">
                            <div className="flex text-xs text-black/90">
                              <p>Sales</p>
                              <p>:</p>
                            </div>
                            <p className=" flex gap-[2px] text-xs font-semibold">
                              {idx?.sales}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col gap-[6px] mt-2 md:flex-row md:flex-wrap">
                        <div className="flex items-center gap-2 px-2 py-1 border rounded-full w-fit">
                          <div className="flex text-xs text-white/70">
                            <p>Price</p>
                            <p>:</p>
                          </div>
                          <p className="text-white font-Poppins flex gap-[2px] text-xs md:text-base"><span>₹</span>{idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx?.price}</p>
                        </div>
                        {(profileData?.overAllGstToggle === 'on' && idx?.isgst) && (
                          <div className="flex items-center gap-2 px-2 py-1 border rounded-full w-fit">
                            <div className="flex text-xs text-white/70">
                              <p>GST</p>
                              <p>:</p>
                            </div>
                            <p className="text-white font-Poppins flex gap-[2px] text-xs md:text-base"><span>₹</span>{idx?.gstAmount}</p>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex gap-2 h-fit">
                      {idx?.productAddedFromStock === 'yes' ? (
                        <button
                          onClick={() => { setOpenProductStockModal(true), setModalId(idx?._id) }}
                          className="p-1 flex h-7 w-7 text-lg  justify-center items-center gap-1 border-[1.5px] rounded-md   border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black">
                          <BiEdit />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setOpenModal(true), setModalType('update'), setModalId(idx?._id) }}
                          className="p-1 flex h-7 w-7 text-lg  justify-center items-center gap-1 border-[1.5px] rounded-md   border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black">
                          <BiEdit />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(idx?._id, idx?.name)}
                        className="p-1 flex h-7 w-7 text-lg justify-center items-center gap-1 border-[1.5px] rounded-md border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black">
                        <MdDeleteOutline />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 px-2 rounded-md border-primaryColor bg-primaryColor backdrop-blur-md">
                      <div className="flex text-xs text-black/70">
                        <p>Total</p>
                        <p>:</p>
                      </div>
                      <p className="text-black font-Poppins flex gap-[2px]"><span>₹</span>
                        <span>{(profileData?.overAllGstToggle === 'on' && idx?.isgst) ? (
                          ((idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx?.price) + idx?.gstAmount).toFixed(2)
                        ) : (
                          (idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx?.price).toFixed(2)
                        )}</span></p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <NoDataFound />
          )}
        </div>
      </div>


      {(loading || getProductData?.isLoading || getProductData?.isFetching || getProductCategoryData.isLoading || getProductCategoryData.isFetching) && <LoaderScreen />}

      {openModal && <ProductCreateModal openModal={openModal} handleClose={() => setOpenModal(!openModal)} modalId={modalId} modalType={modalType}
        productRefetch={() => getProductData?.refetch()} categoryRefetch={() => getProductCategoryData.refetch()} AllProductCountRefetch={() => getProductDataCounts.refetch()} />}

      {openProductStockModal && <StockProductCreateModal openModal={openProductStockModal} handleClose={() => setOpenProductStockModal(!openProductStockModal)}
        stockType={'products'} refetch={() => getProductData.refetch()} modalId={modalId} modalType={'update'} />}
    </>
  )
}

export default ClientProducts