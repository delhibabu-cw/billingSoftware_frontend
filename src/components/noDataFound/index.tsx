
import noDataImg from "../../assets/json/Animation - 1745217715530.json"
import Lottie from 'react-lottie'

function NoDataFound() {

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: noDataImg,
  };
  
  return (
    <div className='py-5 mx-auto font-OpenSans'>
      <div className="w-[70%] sm:w-[50%] md:w-[30%] lg:w-[25%] mx-auto">
      <Lottie options={defaultOptions} />
      </div>
      <p className="mx-auto text-center text-white">No Data Found</p>
</div>
  )
}

export default NoDataFound