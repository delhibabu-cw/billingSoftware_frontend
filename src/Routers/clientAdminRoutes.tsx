import ClientCategory from "../container/ClientAdmin/category";
import ClientBillPage from "../container/ClientAdmin/clientBillPage";
import ClientBills from "../container/ClientAdmin/clientBills";
import ClientHome from "../container/ClientAdmin/clientHome";
import ClientProfile from "../container/ClientAdmin/clientProfile";
import ClientProducts from "../container/ClientAdmin/products";
import ClientStock from "../container/ClientAdmin/stock";
import StockProductSingleView from "../container/ClientAdmin/stock/StockProductSingleView";

export const clientAdminRoutes = [
    {
      path: 'home',
      element: <ClientHome />,
    },
    {
      path: 'category',
      element: <ClientCategory />,
    },
    {
      path: 'products',
      element: <ClientProducts />,
    },
    {
      path: 'profile',
      element: <ClientProfile />,
    },
    {
      path: 'bills',
      element: <ClientBills />,
    },
    {
      path: 'billPage',
      element: <ClientBillPage />,
    },
    {
      path: 'stock',
      element: <ClientStock />,
    },
    {
      path: 'stock/:id',
      element: <StockProductSingleView />,
    },
]