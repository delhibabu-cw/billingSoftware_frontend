import SuperAdminClients from "../container/SuperAdmin/clients";
import SuperAmdinTrashClients from "../container/SuperAdmin/dashboard";
// import SuperAdminDashboard from "../container/SuperAdmin/dashboard";

export const superAdminRoutes = [
    // {
    //   path: 'dashboard',
    //   element: <SuperAdminDashboard />,
    // },
    {
      path: 'clients',
      element: <SuperAdminClients />,
    },
    {
      path: 'trashClients',
      element: <SuperAmdinTrashClients />,
    },
]