import  { useMemo } from 'react'
import { getClientApi, getTrashClientApi } from '../../../api-service/admin';
import { useQuery } from '@tanstack/react-query';
import { decryptPassword, isFormatDate, isFormatTime } from '../../../utils/helper';
import LoaderScreen from '../../../components/animation/loaderScreen/LoaderScreen';

const ClientsSingleViewModal = ({ openModal, handleClose, modalId , openFrom} : any) => {

  if(!openModal) return null;

  let getClientData;

  if(openFrom === 'trashClients'){
     getClientData = useQuery({
      queryKey: ['getClientData', modalId],
      queryFn: () => getTrashClientApi(`/${modalId}`),
  })
  }else{
     getClientData = useQuery({
      queryKey: ['getClientData', modalId],
      queryFn: () => getClientApi(`/${modalId}`),
  })
  }
  

const clientData = getClientData?.data?.data?.result

const plainPassword = useMemo(() => {
  if (clientData?.password && clientData?.passwordIv) {
    const result = decryptPassword(clientData.password, clientData.passwordIv);
    console.log('Decrypted password:', result);
    return result;
  }
  return '';
}, [clientData?.password, clientData?.passwordIv]);


  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
    <div className="bg-white/20 backdrop-blur-lg  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
            <h2 className="text-lg font-semibold text-white font-Montserrat">Client Details</h2>
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
        <div className='flex flex-col h-full gap-3 px-4 pt-4 pb-5 overflow-y-auto hide-scrollbar'>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Client ID</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white'>{clientData?.unquieId}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Client Name</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.fullName}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Brand Name</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.brandName}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Location</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.location}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Email</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.email}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Mobile</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.mobile}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>UserName</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white '>{clientData?.userName}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Password</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{plainPassword}</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>GST %</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.gstPercentage}%</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Validity Year</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.validity} Year</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80'>
              <p>Validity Left</p>
              <p>:</p>
            </div>
            <p className='font-semibold text-white capitalize'>{clientData?.validityLeft} Days</p>
          </div>
          <div className='flex gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80 whitespace-nowrap'>
              <p>Client Created Date</p>
              <p>:</p>
            </div>
            <p className='font-medium text-white capitalize'>{isFormatDate(clientData?.createdAt)} <span className='text-sm'>{isFormatTime(clientData?.createdAt)}</span></p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <div className='flex justify-between w-40 md:w-48 text-white/80 whitespace-nowrap'>
              <p>Renewal History</p>
              <p>:</p>
            </div>
            <div>
              {clientData?.validityHistory?.map((idx:any,index:any) => (
                <div key={index} className='flex h-full overflow-hidden border rounded-br-3xl rounded-tl-3xl'>
                    <div className='flex flex-col items-center justify-center px-2 py-2 text-sm bg-white'>
                      <p className='mb-1 text-xs'>Renewal</p>
                      <p className='font-semibold text-center font-Alice'>{idx?.renewal}</p>
                    </div>
                    <div className='flex items-center gap-3 px-3 py-2 text-sm bg-primaryColor'>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='mb-2 text-xs'>StartDate</span>
                      <span className='font-semibold font-Alice'>{idx?.startDate ? isFormatDate(idx?.startDate) : "-"}</span>
                      <span className='text-xs font-semibold font-Alice'>{idx?.startDate ? isFormatTime(idx?.startDate) : "-"}</span>
                      </div>
                      <span>|</span>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='mb-2 text-xs'>EndDate</span>
                      <span className='font-semibold font-Alice'>{idx?.endDate ? isFormatDate(idx?.endDate) : "-"}</span>
                      <span className='text-xs font-semibold font-Alice'>{idx?.endDate ? isFormatTime(idx?.endDate) : "-"}</span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
          {openFrom === 'trashClients' && (
            <div className='flex flex-wrap gap-3 md:flex-nowrap'>
            <div className='flex justify-between w-40 md:min-w-48 text-white/80 whitespace-nowrap'>
              <p>Deleted History</p>
              <p>:</p>
            </div>
            <div className='flex flex-wrap gap-3'>
              {clientData?.deletedHistory?.map((idx:any,index:any) => (
                <div key={index} className='flex overflow-hidden border h-fit rounded-tr-3xl rounded-bl-3xl'>
                    <div className='flex flex-col items-center justify-center px-2 py-2 text-sm bg-white/50'>
                      <p className='mb-1 text-xs '>S.No</p>
                      <p className='font-semibold text-center font-Alice'>{idx?.sNo}</p>
                    </div>
                    <div className='flex items-center gap-3 px-3 py-2 text-sm bg-primaryColor'>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='mb-2 text-xs'>FromDate</span>
                      <span className='font-semibold font-Alice'>{idx?.from ? isFormatDate(idx?.from) : "-"}</span>
                      <span className='text-xs font-semibold font-Alice'>{idx?.from ? isFormatTime(idx?.from) : "-"}</span>
                      </div>
                      <span>|</span>
                      <div className='flex flex-col items-center justify-center'>
                        <span className='mb-2 text-xs'>ToDate</span>
                      <span className='font-semibold font-Alice'>{idx?.to ? isFormatDate(idx?.to) : "-"}</span>
                      <span className='text-xs font-semibold font-Alice'>{idx?.to ? isFormatTime(idx?.to) : "-"}</span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
    </div>
    </div>

    {(getClientData?.isLoading || getClientData.isFetching) && <LoaderScreen/>}
    </>
  )
}

export default ClientsSingleViewModal