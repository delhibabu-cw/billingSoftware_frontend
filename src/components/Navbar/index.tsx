import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/originalLogo.png";
import { BiLogOut, BiUser } from "react-icons/bi";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../../api-service/authApi";
import { getRoleMenuItems } from "../Menu";
import _ from "lodash"
import userImg from "../../assets/images/logo/logo.jpg"
import LoaderScreen from "../animation/loaderScreen/LoaderScreen";
import { GoDotFill } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion"
import { ImProfile } from "react-icons/im";
import { RiBillLine } from "react-icons/ri";
import { AiOutlineAppstore } from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";

function NavbarIndex() {

  const [openUser, setOpenUser] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null);
  const [menus, setMenus] = useState<any[]>([]);
  // const [menusTitle, setMenusTitle] = useState('');
  const MENUITEMS = menus;
  // const [menuItems , setMenuItems] = useState<any[]>(MENUITEMS);

  const getProfileData = useQuery({
    queryKey: ['getProfileData'],
    queryFn: () => getProfileApi(),
    // enabled: menusTitle != 'default'
  });

  console.log(getProfileData);


  // const role = getProfileData?.data?.data?.result?.roles[0]?.name
  const role = getProfileData?.data?.data?.result?.role?.name

  // console.log(role);


  useEffect(() => {
    if (role) {
      const items = getRoleMenuItems(role);
      setMenus(_.cloneDeep(items));
      // setMenusTitle('')
    } else {
      const defaultItems = getRoleMenuItems(undefined);
      setMenus(_.cloneDeep(defaultItems));
      // setMenusTitle('default');
    }
  }, [role]);

  console.log(MENUITEMS);

  const [loading, setloading] = useState(false)
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent handleClickOutside from firing
    setOpenUser((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setOpenUser(false); // Close the modal
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle outside click for modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);



  const handleLogout = () => {
    setloading(true); // Show loader

    // Clear localStorage items efficiently
    [
      'access-token',
      'role',
      'roleName',
      'userId',
      'refreshToken',
      'name'
    ].forEach((item) => localStorage.removeItem(item));

    // Use a shorter delay of 500ms (0.5 seconds)
    setTimeout(() => {
      setloading(false); // Hide loader
      navigate('/'); // Navigate to login page
    }, 500); // 0.5-second delay
  };

  const StockRouteRegex = /^\/stock(\/[\w-&]+)?$/;

  return (
    <>
      <div className="relative">
        <div className="fixed top-0 pt-3 left-[50%] transform translate-x-[-50%] w-full h-[80px] lg:h-[110px] 2xl:h-[110px]  z-[100] px-[3.5%] ">
          <div className={`flex justify-between items-center px-[3.5%] py-4 lg:py-0 bg-white/10 backdrop-blur-[400px] rounded-2xl `}>
            <img src={logo} className="w-32 sm:w-36 md:w-40 lg:w-48 " alt="Logo" />


            {/* for menu tab mobile size */}
            <div className="lg:hidden ">
              <button
                type="button"
                className="items-center justify-center p-1 rounded-md bg-primaryColor hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primaryColor"
                onClick={() => setOpen(!open)}
              >
                <svg
                  className="h-7 w-7 md:w-9 md:h-9"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <nav className="hidden space-x-2 lg:flex rounded-full bg-white overflow-hidden border border-[#ECF5FF]  font-Montserrat my-4 font-medium w-fit px-[4px] py-[4px]">
              {MENUITEMS.map((item, index) => {

                const dynamicRouteRegex = new RegExp(`^${item.path}(\\/[\\w-&]+)?$`);
                const isActive = dynamicRouteRegex.test(location.pathname);

                return <Link
                  key={index}
                  to={item.path}
                  className={`px-3 2xl:px-4 py-3 rounded-full flex justify-center items-center text-sm 2xl:text-base ${isActive
                    ? 'bg-primaryColor '
                    : 'hover:bg-primaryColor text-[#333333]'
                    }`}
                >
                  <span className="flex justify-center items-center gap-[3px]">{isActive ? <GoDotFill /> : ""} {item.title}</span>
                </Link>

              })}
            </nav>

            <div className="hidden lg:block ">
              <div className="flex items-center gap-2">
               {(getProfileData?.data?.data?.result?.role?.name === 'CLIENTADMIN') && (<>
                <div className="relative">
                  <button 
                  onClick={()=>navigate('/billPage')} className={`flex items-center justify-center w-10 h-10 text-xl border rounded-full group  ${location.pathname === '/billPage' ? "bg-primaryColor text-black" : "text-white/70 border-white/50 hover:bg-primaryColor hover:text-black"}`}>
                    <RiBillLine />
                    <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 rounded-md opacity-0 whitespace-nowrap bg-black/80 -bottom-7 left-1/2 group-hover:opacity-100">
                      Bill Page
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <button 
                  onClick={()=>navigate('/stock')} className={`flex items-center justify-center w-10 h-10 text-xl border rounded-full group  ${StockRouteRegex.test(location.pathname) ? "bg-primaryColor text-black" : "text-white/70 border-white/50 hover:bg-primaryColor hover:text-black"}`}>
                    <AiOutlineAppstore />
                    <span className="absolute px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 rounded-md opacity-0 whitespace-nowrap bg-black/80 -bottom-7 left-1/2 group-hover:opacity-100">
                      Stock
                    </span>
                  </button>
                </div>
               </>)}


                <div
                  className="relative flex items-center justify-center gap-2 cursor-pointer"
                  onClick={toggleDropdown}
                  ref={userRef}
                >
                  {getProfileData?.data?.data?.result?.img_url ? (
                    <img
                    src={getProfileData?.data?.data?.result?.img_url}
                    className="rounded-full w-11 2xl:w-14 h-11 2xl:h-14"
                  alt={userImg}
                  />
                  ) : (
                    <FaUserCircle className="rounded-full w-11 2xl:w-14 h-11 2xl:h-14 text-primaryColor"/>
                  )}
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-white capitalize font-Montserrat 2xl:text-base">
                      {getProfileData?.data?.data?.result?.fullName
                        ? getProfileData.data.data.result.fullName.length > 10
                          ? `${getProfileData.data.data.result.fullName.slice(0, 10)}...`
                          : getProfileData.data.data.result.fullName
                        : "-"}
                    </p>
                    <p className="font-medium font-Montserrat text-[#c2c5c9] text-[10px] 2xl:text-xs ">
                      {getProfileData?.data?.data?.result?.role?.name || "-"}
                    </p>
                  </div>

                  {/* Smooth Transition Dropdown */}
                  <div
                    className={`absolute top-16 z-50 w-full border-[1px] border-black/20 bg-white transition-all duration-300 ease-in-out rounded-[4px] shadow-md ${openUser
                      ? "opacity-100 scale-y-100 visible"
                      : "opacity-0 scale-y-0 invisible"
                      }`}
                    style={{
                      transformOrigin: "top", // Smooth scaling from the top
                    }}
                  >
                    {getProfileData?.data?.data?.result?.role?.name != 'SUPERADMIN' && (
                       <div
                       className="flex items-center gap-2 border-b-[1px] py-1 px-2 hover:bg-primaryColor cursor-pointer font-Poppins"
                       // onClick={(e) => e.stopPropagation()}
                       onClick={() => navigate('/profile')}
                     >
                       <BiUser />
                       <p>Profile</p>
                     </div>
                    )}
                    <div
                      className="flex items-center gap-2 px-2 py-1 cursor-pointer font-Poppins hover:bg-primaryColor"
                      onClick={handleLogout}
                    >
                      <BiLogOut />
                      <p>Logout</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: "-40%" }}
              animate={{ opacity: 1, scale: 1, y: "0%" }}
              exit={{ opacity: 0, scale: 0.9, y: "-50%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="z-[100] fixed top-0 inset-x-0 p-2 lg:hidden"

            >
              <div className="w-full px-3 py-2 border shadow-lg ring-1 ring-black ring-opacity-5 bg-white/15 backdrop-blur-3xl rounded-2xl border-white/20"
              >
                <div className="pt-5 pb-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4">
                    <div className="flex items-center">
                      <img className="w-auto h-14" src={logo} alt="Workflow" />
                    </div>
                    <div className="">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setOpen(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <hr />
                  {/* Navigation */}
                  <nav className="flex flex-col px-2 mt-5 gap-y-3 w-fit">
                    {MENUITEMS.map((item, index) => {
                      const dynamicRouteRegex = new RegExp(`^${item.path}(\\/[\\w-&]+)?$`);
                      const isActive = dynamicRouteRegex.test(location.pathname);

                      return (
                        <Link
                          key={index}
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={`px-3 2xl:px-4 py-3 rounded-full flex justify-center items-center text-sm 2xl:text-base transition-all duration-200 ${isActive ? "bg-primaryColor" : "hover:bg-primaryColor text-[#333333] bg-white"
                            }`}
                        >
                          <span className="flex justify-center items-center gap-[3px]">
                            {isActive && <GoDotFill />} {item.title}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="flex gap-2 mt-3">
                  {(getProfileData?.data?.data?.result?.role?.name === 'CLIENTADMIN') && (<>
                  <button 
                  onClick={()=>{navigate('/billPage'),setOpen(false)}} className={`flex items-center justify-center gap-1  text-xl border rounded-full px-3 py-2 ${location.pathname === '/billPage' ? "bg-primaryColor text-black" : "text-white/70 border-white/50 hover:bg-primaryColor hover:text-black"}`}>
                    <RiBillLine />
                    <span className="text-sm">Bill Page</span>
                  </button>
                  <button 
                  onClick={()=>{navigate('/stock'),setOpen(false)}} className={`flex items-center justify-center gap-1  text-xl border rounded-full px-3 py-2 ${StockRouteRegex.test(location.pathname) ? "bg-primaryColor text-black" : "text-white/70 border-white/50 hover:bg-primaryColor hover:text-black"}`}>
                    <AiOutlineAppstore />
                    <span className="text-sm">Stock</span>
                  </button>
                <button
                        onClick={() => { navigate('/profile'), setOpen(false) }}
                        className={`flex items-center justify-center gap-1  text-xl border rounded-full px-3 py-2 ${location.pathname === '/profile' ? "bg-primaryColor text-black" : "text-white/70 border-white/50 hover:bg-primaryColor hover:text-black"}`}>
                        <ImProfile />
                        <span className="text-sm">Profile</span>
                      </button>
               </>)}

                  </div>

                  <div className="flex items-center justify-between mt-7">
                    <div className="flex items-center justify-center gap-2 cursor-pointer ">
                    {getProfileData?.data?.data?.result?.img_url ? (
                    <img
                    src={getProfileData?.data?.data?.result?.img_url}
                    className="rounded-full w-11 2xl:w-14 h-11 2xl:h-14"
                  alt={userImg}
                  />
                  ) : (
                    <FaUserCircle className="rounded-full w-11 2xl:w-14 h-11 2xl:h-14 text-primaryColor"/>
                  )}
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-white capitalize font-Montserrat 2xl:text-base">
                          {getProfileData?.data?.data?.result?.fullName
                            ? getProfileData.data.data.result.fullName.length > 10
                              ? `${getProfileData.data.data.result.fullName.slice(0, 10)}...`
                              : getProfileData.data.data.result.fullName
                            : "-"}
                        </p>
                        <p className="font-medium font-Montserrat text-[#c2c5c9] text-[10px] 2xl:text-xs ">
                          {getProfileData?.data?.data?.result?.role?.name || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      
                      <div
                        className="flex items-center gap-2 px-2 py-1 bg-white rounded-md cursor-pointer font-Poppins hover:bg-primaryColor"
                        onClick={handleLogout}
                      >
                        <BiLogOut />
                        <p>Logout</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>


      {loading && <LoaderScreen />}
    </>

  );
}

export default NavbarIndex;
