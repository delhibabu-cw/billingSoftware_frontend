import noDataImg from "../../assets/images/noDataFound/image 1866.png"

function NoDataFound() {
  return (
    <div className='py-5 mx-auto font-OpenSans'>
    <img src={noDataImg} className='mx-auto w-36 2xl:w-40' alt="No Image" />
    <p className='mt-3 text-sm text-center text-white font-Poppins'>No Data Found</p>
</div>
  )
}

export default NoDataFound