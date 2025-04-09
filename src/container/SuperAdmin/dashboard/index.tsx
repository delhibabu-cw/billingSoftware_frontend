import { useQuery } from "@tanstack/react-query"
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen"
import { getTrashClientApi, putRestoreClientApi } from "../../../api-service/admin"
import NoDataFound from "../../../components/noDataFound"
import { FaArrowLeftLong, FaArrowRightLong, FaChevronDown, FaEye } from "react-icons/fa6"
import { useState } from "react"
// import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
// import Select from 'react-select';
import Pagination from "../../../components/pagination"
import toast from "react-hot-toast"
import { FaTrashRestore } from "react-icons/fa"
import ClientsSingleViewModal from "../clients/ClientsSingleViewModal"
import { useNavigate } from "react-router-dom"
import { isFormatDate, isFormatTime } from "../../../utils/helper"


const SuperAmdinTrashClients = () => {

  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate()
  // const [selectedProjectOption, setSelectedProjectOption] = useState();
  // const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("10");
  const options = ["5", "7", "10", "20"]; // Add as many as you need
  // const [openModal, setOpenModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openSingleView, setOpenSingleView] = useState(false)
  const [singleViewId, setSingleViewId] = useState('')

  // const getRoleData = useQuery({
  //     queryKey: ['getRoleData'],
  //     queryFn: () => getRoleApi(``)
  // })

  // const roleDropdown = getRoleData.data?.data?.result?.map((item: any) => (
  //     { value: item?._id, label: item?.name }
  // ))

  const getTrashClientData = useQuery({
    queryKey: ['getTrashClientData', search, selectedValue],
    queryFn: () => getTrashClientApi(`?search=${search}&perPage=${selectedValue}`),
  })

  const userData = getTrashClientData?.data?.data?.result?.rows
  const totalPages = getTrashClientData?.data?.data?.result?.pagination?.pages;

  // const handleProjectChange = (selected: any) => {
  //     console.log(selected);

  //     setSelectedProjectOption(selected);
  //     setSelectedProjectId(selected?.value || '')
  // };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectOption = (value: any) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  const handleDelete = async (id: any) => {
    try {
      setLoading(true)

      const deleteApi = await putRestoreClientApi(id)
      if (deleteApi?.status === 200) {
        toast.success(deleteApi?.data?.msg)
        getTrashClientData.refetch()
        navigate('/clients')
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
            placeholder="Search by Name,mobile..."
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none" />
        </div>

        {userData?.length > 0 ? (
          <div className="">
            <div className="border-[2px] border-white/50 shadow-xl rounded-md  mt-5 overflow-x-auto block w-full hide-scrollbar">
              <table className="min-w-full overflow-y-visible whitespace-nowrap ">
                <thead className="border-b bg-white/15 backdrop-blur-none text-white/80 border-white/70">
                  <tr className="">
                    <td className="p-3 font-medium font-Montserrat ">S.NO</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Client ID</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Client Name</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Brand Name</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Location</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Validity</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Deleted</td>
                    <td className="p-3 font-medium capitalize font-Montserrat">Action</td>
                  </tr>
                </thead>
                <tbody className="">

                  {userData?.map((idx: any, index: number) => (
                    <tr key={index} className={"bg-white/15 border-b border-white/70 "}>
                      <td className="p-3 text-white/90">{index + 1}.</td>
                      <td className="p-3">
                        <p className="font-semibold text-white">{idx?.unquieId ? idx?.unquieId : "-"}</p>
                      </td>
                      <td className="flex flex-wrap p-3 max-w-40 2xl:max-w-44">
                        <div className="text-white ">{idx?.fullName ? idx?.fullName : "-"}</div>
                      </td>


                      <td className="p-3 ">
                        <div className="text-white ">{idx?.brandName ? idx?.brandName : "-"}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white ">{idx?.location ? idx?.location : "-"}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-white ">{idx?.validityLeft ? <span>{idx?.validityLeft} <span className="text-sm">Days</span></span> : "-"}</div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium capitalize text-primaryColor">
                          {idx?.deletedHistory?.length > 0 ? (
                            <>
                              {isFormatDate(idx?.deletedHistory[idx.deletedHistory.length - 1]?.from)}{" "}
                              <span className="text-sm">
                                {isFormatTime(idx?.deletedHistory[idx.deletedHistory.length - 1]?.from)}
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </p>
                      </td>
                      <td className="flex gap-3 p-3">
                        <button
                        title="Client View"
                          className="flex items-center justify-center w-8 h-8 bg-white text-[#333333] rounded-md hover:bg-primaryColor hover:text-black"
                          onClick={() => { setOpenSingleView(true), setSingleViewId(idx?._id) }}
                        >
                          <FaEye className="" />
                        </button>
                        <button
                          title="Restore Client"
                          className="flex items-center justify-center w-8 h-8 bg-white text-[#333333] rounded-md hover:bg-primaryColor hover:text-black"
                          onClick={() => handleDelete(`${idx?._id}`)}>
                          {/* <MdLockReset className="text-xl" /> */}
                          <FaTrashRestore className="" />
                        </button>
                      </td>
                    </tr>
                  ))}



                </tbody>
              </table>
            </div>
            <div className="px-3 pb-4 mt-4 box-footer">
              <div className="flex items-center">
                <div className="relative inline-block text-sm text-white/90 font-Poppins">
                  {/* Dropdown Toggle */}
                  <div
                    className="flex items-center space-x-2 cursor-pointer select-none"
                    onClick={toggleDropdown}
                  >
                    <span className="font-medium">Rows per page :</span>
                    <span className="font-semibold">{selectedValue}</span>
                    <FaChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>

                  {/* Dropdown Options */}
                  {isOpen && (
                    <ul className="absolute left-0 z-10 w-32 mt-2 overflow-hidden border border-gray-300 rounded-md shadow-lg bg-white/15">
                      {options.map((option, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 text-sm text-white cursor-pointer hover:bg-primaryColor hover:text-black"
                          onClick={() => selectOption(option)}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="ms-auto">
                  <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
                    <ul className="flex items-center justify-center gap-2">
                      {/* Previous Button */}
                      <li
                        className={`h-8 w-8 flex justify-center items-center rounded-tl-full rounded-bl-full rounded-tr-md rounded-br-3xl border border-primaryColor shadow-sm text-primaryColor bg-white/20   ${currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryColor hover:text-black"
                          }`}
                      >
                        <button
                          aria-label="Previous"
                          className="flex items-center justify-center w-full h-full"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                        >
                          <FaArrowLeftLong />
                        </button>
                      </li>

                      {/* Pagination Numbers */}
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

                      {/* Next Button */}
                      <li
                        className={`h-8 w-8 flex justify-center items-center rounded-tr-full rounded-br-full rounded-tl-md rounded-bt-3xl border border-primaryColor shadow-sm text-primaryColor bg-white/20 ${currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-primaryColor hover:text-black"
                          }`}
                      >
                        <button
                          aria-label="Next"
                          className="flex items-center justify-center w-full h-full"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages - 1}
                        >
                          <FaArrowRightLong />
                        </button>
                      </li>
                    </ul>
                  </nav>

                </div>
              </div>
            </div>
          </div>
        ) : (
          <NoDataFound />
        )}
      </div>


      {(loading || getTrashClientData?.isLoading || getTrashClientData?.isFetching) && <LoaderScreen />}

      {/* {openModal && <ClientsCreateModal openModal={openModal} handleClose={() => setOpenModal(!openModal)}
                refetch={() => getTrashClientData?.refetch()} modalId={singleViewId}/>} */}

      {openSingleView && <ClientsSingleViewModal openModal={openSingleView} handleClose={() => setOpenSingleView(!openSingleView)}
        modalId={singleViewId} openFrom={'trashClients'} />}
    </>
  )
}

export default SuperAmdinTrashClients