import { Outlet } from "react-router-dom"
import NavbarIndex from "../components/Navbar"


function Pages() {
    
  return (
    <div>
        <NavbarIndex/>
        <Outlet/>
        {/* <FooterIndex/> */}
    </div>
  )
}

export default Pages