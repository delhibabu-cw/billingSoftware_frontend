import { useQuery } from "@tanstack/react-query";
import { getProductApi } from "../../../api-service/client";
import { useEffect, useState, useRef } from "react";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";

// Define a type for Product
type Product = {
  _id: string;
  name: string;
  shortcutKey: number;
  quantity: number;
  [key: string]: any; // allows additional dynamic keys
};

const ShortcutPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]); // Properly typed
  const inputRef = useRef<HTMLInputElement>(null);

  const getProductData = useQuery({
    queryKey: ["getProductData"],
    queryFn: () => getProductApi(``),
  });

  useEffect(() => {
    if (getProductData?.data?.data?.result) {
      setData(getProductData.data.data.result);
    }
    inputRef.current?.focus();
  }, [getProductData]);

  const addOrUpdateProduct = (shortcutKey: number) => {
    const match = data?.find((item: any) => item.shortcutKey === shortcutKey);
    if (!match) {
      setNotFound(true);
      return;
    }

    setNotFound(false);

    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p._id === match._id);
      if (existing) {
        return prev.map((p) =>
          p._id === match._id ? { ...p, quantity: p.quantity + 1 } : p
        );
      } else {
        return [...prev, { ...match, quantity: 1 }];
      }
    });

    setSearch(""); // Reset input
  };

  const updateLastQuantity = (delta: number) => {
    if (selectedProducts.length === 0) return;
    const lastIndex = selectedProducts.length - 1;
    const updated = [...selectedProducts];
    updated[lastIndex].quantity = Math.max(
      1,
      (updated[lastIndex].quantity || 1) + delta
    );
    setSelectedProducts(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      const shortcut = Number(search.trim());
      if (!isNaN(shortcut)) {
        addOrUpdateProduct(shortcut);
      }
    } else if (e.key === "+") {
      updateLastQuantity(1);
    } else if (e.key === "-") {
      updateLastQuantity(-1);
    }
  };

  console.log(selectedProducts);
  

  return (
    <>
      <div className="h-full pt-28 lg:pt-32 px-[4%] pb-10">
        <div className="flex justify-center w-[80%] lg:w-[60%] mx-auto">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter Shortcut Key..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value.replace(/\D/g, "")) // Only digits
            }
            onKeyDown={handleKeyDown}
            className="bg-white/10 px-3 pt-[6px] pb-[9px] rounded-md placeholder:text-white/70 placeholder:text-xs w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
          />
        </div>

        {notFound && (
          <div className="text-red-500 text-center mt-3">
            No matching product found.
          </div>
        )}

        {/* ✅ Show selected products */}
        <div className="mt-10 max-w-2xl mx-auto text-white">
          <h2 className="text-lg font-semibold mb-3">Selected Products:</h2>
          {selectedProducts.length === 0 ? (
            <p className="text-gray-400">No products added.</p>
          ) : (
            <ul className="space-y-2">
              {selectedProducts.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between bg-white/10 px-4 py-2 rounded"
                >
                  <span>{item.name}</span>
                  <span>Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {(getProductData?.isLoading || getProductData.isFetching) && (
        <LoaderScreen />
      )}
    </>
  );
};

export default ShortcutPage;
