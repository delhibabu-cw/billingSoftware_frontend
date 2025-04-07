import SuperAdminClients from "../container/SuperAdmin/clients";
import SuperAdminDashboard from "../container/SuperAdmin/dashboard";

export const superAdminRoutes = [
    {
      path: 'dashboard',
      element: <SuperAdminDashboard />,
    },
    {
      path: 'clients',
      element: <SuperAdminClients />,
    },
]