import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../api-service/authApi";
import { superAdminRoutes } from "./superAdminRoutes";
import { employeeAdminRoutes } from "./employeeAdminRoutes";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
import Pages from "../pages";
import Login from "../container/login";
import LoaderScreen from "../components/animation/loaderScreen/LoaderScreen";
import { clientAdminRoutes } from "./clientAdminRoutes";

// function NoRoutesMatched() {
//   return (
//     <div className="flex items-center justify-center h-screen bg-black bg-opacity-50">
//       <p className="text-xl font-bold text-white">No Page Found</p>
//     </div>
//   );
// }

const Router = () => {

    const hasToken = Boolean(localStorage.getItem("access-token"));
    const location = useLocation(); // Get the current route
  
    const getProfileData = useQuery({
      queryKey: ["getProfileData"],
      queryFn: () => getProfileApi(),
      enabled: hasToken, // Only fetch if the token exists
    });
  
    const role = getProfileData?.data?.data?.result?.role?.name;

    function selectRouteByRole() {
        switch (role) {
          case "SUPERADMIN":
            return superAdminRoutes;
          case "CLIENTADMIN":
            return clientAdminRoutes;
          case "EMPLOYEE":
            return employeeAdminRoutes;
          default:
            return [];
        }
      }

      const clearStorageRoutes = [
        "/",
        "/login",
      ];
      if (clearStorageRoutes.includes(location.pathname)) {
        localStorage.clear();
      }

      if(getProfileData?.isLoading || (hasToken && !getProfileData?.isFetched)){
        return <LoaderScreen/>
      }
  
      const routes = [
        {
          path: "/",
          element: hasToken ? <Pages /> : <Navigate to="/login" replace />,
          children:selectRouteByRole(),
        },
        {
            path: "/login",
            element: <Login />,
          },
        // {
        //   path: "*",
        //   element: <NoRoutesMatched />,
        // },
      ];
    
      // Render routes only after profile data and role are determined
      return useRoutes(routes);
    
}

export default Router