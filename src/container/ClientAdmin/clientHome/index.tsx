import { useQuery } from "@tanstack/react-query";
import { getBillPageApi, getProductCategoryApi, postCreateBillApi, putClientProfileApi } from "../../../api-service/client";
import { FaAngleDown, FaAngleUp, FaMinus, FaPlus, FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { getProfileApi } from "../../../api-service/authApi";
import { useCallback, useMemo, useState } from "react";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { HiOutlineDocumentCurrencyRupee } from "react-icons/hi2";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TiInputChecked } from "react-icons/ti";
import CreateBillModal from "./CreateBillModal";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { isFormatDate, isFormatTime } from "../../../utils/helper";
import NoImg from  "../../../assets/images/noDataFound/noImage.jpg"

const ClientHome = () => {

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [openModal, setOpenModal] = useState(false)
    // const [billData, setBillData] = useState<any>(null);

    const getProfileData = useQuery({
        queryKey: ["getProfileData"],
        queryFn: () => getProfileApi(),
    });

    const profileData = getProfileData?.data?.data?.result;

    const getProductCategoryData = useQuery({
        queryKey: ["getProductCategoryData", search],
        queryFn: () => getProductCategoryApi(`?search=${search}`),
    });

    const productCategoryData = getProductCategoryData?.data?.data?.result || [];

    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>({});
    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});

    const handleProductClick = useCallback(
        (product: any) => {
            if (!selectedProducts.some((p: any) => p._id === product._id)) {
                setSelectedProducts((prev: any) => [
                    ...prev,
                    { ...product, quantitySelected: 1 },
                ]);
            }
        },
        [selectedProducts]
    );

    const handleRemoveClick = useCallback((productId: any) => {
        setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    }, []);


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setSearchQueries((prev) => ({
            ...prev,
            [index]: e.target.value,
        }));
    };

    const handleQuantityChange = useCallback((productId: any, newQuantity: any) => {
        setSelectedProducts(prev => prev.map(p =>
            p._id === productId ? { ...p, quantitySelected: Math.max(newQuantity, 1) } : p
        ));
    }, []);

    const toggleButton = (index: number) => {
        setToggleStates((prev) => ({ ...prev, [index]: !prev[index] }));
        setSearchQueries((prev) => ({ ...prev, [index]: "" }))
    };


    // 🟢 Memoizing filtered items outside map
    const filteredItemsMap = useMemo(() => {
        const result: { [key: number]: any[] } = {};
        productCategoryData.forEach((idx: any, index: number) => {
            if (!searchQueries[index]) {
                result[index] = idx?.productItems || [];
            } else {
                result[index] = idx?.productItems?.filter((item: any, i: number) =>
                    item.name.toLowerCase().includes(searchQueries[index].toLowerCase()) ||
                    i + 1 === parseInt(searchQueries[index])
                );
            }
        });
        return result;
    }, [searchQueries, productCategoryData]);

    console.log(selectedProducts);



    // for gst showing
    // const [showFullMessage, setShowFullMessage] = useState(false);
    // useEffect(() => {
    //     if (!profileData?.gstPercentage) {
    //         // Show message every 20 sec, then hide after 5 sec
    //         const interval = setInterval(() => {
    //             setShowFullMessage(true);
    //             setTimeout(() => setShowFullMessage(false), 5000); // Hide after 5 sec
    //         }, 10000); // Trigger every 20 sec

    //         return () => clearInterval(interval); // Cleanup on unmount
    //     }
    // }, [profileData]);


    const handleToggleButton = async (title: any, data: any) => {
        try {
            setLoading(true)

            let payload;

            if (title === 'gstToggle') {
                payload = { overAllGstToggle: data }
            } else if (title === 'customerToggle') {
                payload = { customerToggle: data }
            } else if (title === 'employeeToggle') {
                payload = { employeeToggle: data }
            }

            const postApi = await putClientProfileApi(payload, profileData?._id)
            if (postApi?.status === 200) {
                toast.success(postApi?.data?.msg)
                getProfileData.refetch()
            }
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    // const totalAmount = useMemo(() => {
    //     return selectedProducts?.reduce((sum, product) => {
    //         const productTotal = profileData?.overAllGstToggle === 'on'
    //             ? (product?.total + product?.gstAmount) * product.quantitySelected // Include GST
    //             : product?.total * product?.quantitySelected; // Exclude GST

    //         return sum + productTotal;
    //     }, 0).toFixed(2);
    // }, [selectedProducts, profileData?.overAllGstToggle]);

    const totalAmount = useMemo(() => {
        if (!selectedProducts || selectedProducts.length === 0) return '0.00';

        return selectedProducts.reduce((sum: any, product: any) => {
            const unitPrice = product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price;
            const gstPerUnit = profileData?.overAllGstToggle === 'on' ? product?.gstAmount : 0;

            const totalPerItem = (unitPrice + gstPerUnit) * product?.quantitySelected;
            return sum + totalPerItem;
        }, 0).toFixed(2);
    }, [selectedProducts, profileData?.overAllGstToggle]);


    console.log('totalAmount', totalAmount);
    console.log('selected products', selectedProducts);

    const getBillPageData = useQuery({
        queryKey: ["getBillPageData"],
        queryFn: () => getBillPageApi(""),
        enabled: profileData?.billPageDetails === 'yes'
    });

    const handleCreateBill = async () => {
        try {
            setLoading(true);

            const payload = {
                totalAmount,
                selectedProducts: selectedProducts?.map((idx: any) => {
                    const gstAmountPerUnit =
                        profileData?.overAllGstToggle === "on" ? idx.gstAmount : 0;
                    const totalGstAmount = gstAmountPerUnit * idx.quantitySelected;

                    return {
                        productId: idx?._id,
                        quantity: idx?.quantitySelected,
                        name: idx?.name,
                        price: idx.price,
                        actualPrice: idx?.actualPrice,
                        profitMargin: idx?.profitMargin,
                        gstAmount: totalGstAmount,
                        gstWithoutTotal:
                            (idx?.productAddedFromStock === "yes"
                                ? idx?.actualPrice
                                : idx.price) * idx.quantitySelected,
                        gstWithTotal:
                            profileData?.overAllGstToggle === "on"
                                ? (idx?.productAddedFromStock === "yes"
                                    ? idx?.actualPrice
                                    : idx.price + idx.gstAmount) * idx.quantitySelected
                                : (idx?.productAddedFromStock === "yes"
                                    ? idx?.actualPrice
                                    : idx.price) * idx.quantitySelected,
                        productAddedFromStock: idx?.productAddedFromStock,
                    };
                }),
            };

            const postApi = await postCreateBillApi(payload);

            if (postApi?.status === 200) {
                toast.success(postApi?.data?.msg);
                const billPayload = {
                    billNo: postApi?.data?.result?.billNo || "N/A",
                    dateTime: postApi?.data?.result?.createdAt,
                    totalAmount: payload.totalAmount,
                    selectedProducts: payload.selectedProducts,
                    customer: postApi?.data?.result?.customer,
                    employee: postApi?.data?.result?.employee,
                };

                // Wait for the query to refetch with billData
                await getBillPageData.refetch();

                // Then print
                handlePrint(billPayload, getBillPageData?.data?.data?.result);

                setSelectedProducts([]);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // const handlePrint = (billData: any, billPageData: any) => {
    //     const printContent = generatePrintContent(billData, billPageData);

    //     const iframe = document.createElement("iframe");
    //     iframe.style.position = "fixed";
    //     iframe.style.top = "-10000px";
    //     iframe.style.left = "-10000px";
    //     document.body.appendChild(iframe);

    //     const contentWindow = iframe.contentWindow;
    //     if (!contentWindow) return;

    //     const doc = contentWindow.document;
    //     doc.open();
    //     doc.write(printContent);
    //     doc.close();

    //     iframe.onload = () => {
    //       setTimeout(() => {
    //         contentWindow.focus();
    //         contentWindow.print();

    //         // Listen for afterprint event to refresh the page once print dialog is closed
    //         contentWindow.addEventListener('afterprint', () => {
    //           // Refresh the page
    //           window.location.reload();
    //         });

    //         setTimeout(() => {
    //           document.body.removeChild(iframe);
    //         }, 1000);
    //       }, 500);
    //     };
    //   };

    const handlePrint = (billData: any, billPageData: any) => {
        const printContent = generatePrintContent(billData, billPageData);

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.top = "-10000px";
        iframe.style.left = "-10000px";
        document.body.appendChild(iframe);

        const contentWindow = iframe.contentWindow;
        if (!contentWindow) return;

        const doc = contentWindow.document;
        doc.open();
        doc.write(printContent);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => {
                contentWindow.focus();
                contentWindow.print();

                // ✅ Immediately refetch your API after triggering print
                getProductCategoryData.refetch();

                // Optional: cleanup the iframe after a second
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        };
    };

    const generatePrintContent = (billData: any, billPageData: any) => {
        const totalPrice = billData?.selectedProducts.reduce(
            (sum: any, product: any) =>
                sum +
                ((product?.productAddedFromStock === "yes"
                    ? product?.actualPrice
                    : product?.price) *
                    product.quantity || 0),
            0
        );

        const totalGst = billData?.selectedProducts.reduce(
            (sum: any, product: any) => sum + (product.gstAmount || 0),
            0
        );

        const fontClass = billPageData?.font || "";
        let googleFontLink = "";
        let customFontStyle = "";

        if (fontClass) {
            const fontName = fontClass.replace("font-", "").replace(/\+/g, " ");
            googleFontLink = `<link href="https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&display=swap" rel="stylesheet">`;
            customFontStyle = `<style>.${fontClass} { font-family: '${fontName}', sans-serif; }</style>`;
        }

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Print Bill</title>
          <script src="https://cdn.tailwindcss.com"></script>
          ${googleFontLink}
          ${customFontStyle}
        </head>
        <body>
          <div class="!p-0 !mb-5 !mt-0  h-full ${billPageData?.printSize} ${billPageData?.font}">
          <!-- Invoice Info -->
            <div class="grid grid-cols-3 gap-1 text-sm items-start">
              <p class="font-semibold">Invoice</p>
        
              ${billPageData?.invoiceFields?.showInvoiceNo
                ? `<p class="text-center">Bill No: <span class="font-semibold">${billData?.billNo}</span></p>`
                : `<p></p>`
            }
        
            <div class="  text-[11px] ml-auto">
                <span class="flex items-center gap-1">
                    <!-- Calendar Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="!h-3 !w-3 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-13 6h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ${isFormatDate(billData?.dateTime)}
                </span>
                <span class="flex items-center gap-1">
                    <!-- Clock Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${isFormatTime(billData?.dateTime)}
                </span>
                </div>
            </div>
            
            <!-- Header Section -->
            <div class="flex flex-col items-center gap-2 mt-2">
              ${billPageData?.header?.logo?.logo_Url
                ? `<img
                    src="${billPageData?.header?.logo?.logo_Url}"
                    alt="Logo"
                    class="${billPageData?.header?.logo?.logoWidth || "w-36"} ${billPageData?.header?.logo?.logoHeight || "h-36"}
                           ${billPageData?.header?.logo?.logoCircle ? "rounded-full" : "rounded"}
                           ${billPageData?.header?.logoZoom ? "object-cover" : "object-fill"}
                           shadow"
                  />`
                : ""
            }
        
              ${billPageData?.header?.businessName
                ? `<h1 class="text-2xl font-bold text-center capitalize">${billPageData?.header?.businessName}</h1>`
                : ""
            }
        
              ${billPageData?.header?.address
                ? `<p class="text-center text-xs capitalize">${billPageData?.header?.address}</p>`
                : ""
            }
             
            </div>
             ${billPageData?.header?.contact
                ? `<div class='flex gap-1 justify-center items-center mt-1'>
                    <!-- Phone Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8a1 1 0 01-.293.707L8.414 10.414a16.016 16.016 0 007.172 7.172l1.707-1.707a1 1 0 01.707-.293h1.586a1 1 0 011 1v2.586a2 2 0 01-2 2A17 17 0 013 5z" />
                    </svg>
                    <p class="text-sm">${billPageData?.header?.contact}</p>
                </div>`
                : ""
            }
        
            <!-- Parties -->
            <div class="flex justify-between mt-2">
              ${profileData?.customerToggle === 'on'
                ? `<div>
                    <p class="font-semibold !text-xs">Customer Details</p>
                    <div class=''>
                    <p class='!text-[10px]'>Name: <span class="font-semibold">${billData?.customer?.name?.length > 10 ? billData?.customer?.name?.slice(0, 10) + '..' : billData?.customer?.name || ""}</span></p>
                    <p class='!text-[10px]'>Mobile: <span class="font-semibold">${billData?.customer?.mobile || ""}</span></p>
                    </div>
                </div>`
                : ""
            }
        
              ${profileData?.employeeToggle === 'on'
                ?
                `<div>
                    <p class="font-semibold !text-xs">Employee Details</p>
                    <div className=''>
                    <p class='!text-[10px]'>Id: <span class="font-semibold">${billData?.employee?.unquieId || ""}</span></p>
                    </div>
                  </div>`
                : ""
            }
            </div>
        
            <!-- Title -->
            ${billPageData?.showTable ? `<hr class="my-1 border-dashed border-black/80" />` : ``}
            <h2 class="text-center font-semibold text-lg">Cash Bill</h2>
            <hr class=" ${billPageData?.showTable ? `` : 'my-[3px]'} border-dashed border-black/80" />
        
                <!-- Table -->
          <table class="w-[98%] ${billPageData?.showTable ? "border-black/50 border border-collapse" : "border-none"} text-xs mx-auto ${billPageData?.showTable ? `mt-2` : ''}">
              <thead>
                <tr class="bg-gray-400 ${billPageData?.showTable ? "border-black/50 border" : "border-b border-dashed border-black"}">
                  <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">S.No</th>
                  <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Name</th>
                  <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Price</th>
                  <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Qty</th>
                  <th class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Amount</th>
                </tr>
              </thead>
              <tbody class="${billPageData?.showTable ? "border-black/50 border" : "border-b border-dashed border-black"}">
                ${billData?.selectedProducts?.map((item: any, index: any) => {
                const price = item.productAddedFromStock === "yes" ? item.actualPrice : item.price;
                const amount = price * item.quantity;
                return `
                    <tr >
                      <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center">${index + 1}</td>
                      <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} capitalize !whitespace-normal">${item.name}</td>
                      <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center whitespace-nowrap">₹ ${price.toLocaleString("en-IN")}</td>
                      <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center">${item.quantity}</td>
                      <td class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"} text-center whitespace-nowrap">₹ ${amount.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
            }).join("")}
              </tbody>
              <tfoot class="font-medium ">
                ${billData?.selectedProducts.some((item:any) => item.gstAmount > 0)
                ? `
                      <tr>
                        <td colspan="4" class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Sub Total</td>
                        <td class="p-1 border text-center ${billPageData?.showTable ? "border-black/50 border" : "border-none"} whitespace-nowrap">₹ ${totalPrice.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr class="${billPageData?.showTable ? "border-black/50 border" : "border-b border-dashed border-black"}">
                        <td colspan="4" class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">GST (${profileData?.gstPercentage}%)</td>
                        <td class="p-1 border text-center ${billPageData?.showTable ? "border-black/50 border" : "border-none"} whitespace-nowrap">₹ ${totalGst.toLocaleString("en-IN")}</td>
                      </tr>
                    `
                : ""
            }
                <tr class="font-semibold text-sm">
                  <td colspan="4" class="p-1 border ${billPageData?.showTable ? "border-black/50 border" : "border-none"}">Total</td>
                  <td class="p-1 border text-center ${billPageData?.showTable ? "border-black/50 border" : "border-none"} whitespace-nowrap">₹ ${Number(billData?.totalAmount).toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
        
            ${billPageData?.footer?.terms
                ? `<p class="text-center text-xs mt-4">${billPageData?.footer?.terms}</p>`
                : ""
            }
            <p class="!my-2 text-[10px] !text-center whitespace-nowrap !mb-10 !pb-10">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
          </div>
        </body>
        </html>
        `;
    };

    return (
        <>
            <div className="relative  h-full pt-24 lg:pt-28 px-[4%] pb-10">
                <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
                <div className="absolute bottom-0 right-0 bg-white h-[70%] w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <input
                        type="search"
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search Category Here..."
                        className="bg-white/10 backdrop-blur-none px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-fit md:max-w-xs md:w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                    />

                    <div className="flex flex-wrap items-center gap-3 ">
                        <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor cursor-pointer hover:bg-primaryColor hover:text-black"
                            onClick={() => navigate('/profile')}>
                            <div className="flex items-center">
                                <HiOutlineDocumentCurrencyRupee size={30} />
                                <p>GST %</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="">:</span>
                                <span className="text-lg font-bold">{profileData?.gstPercentage}</span>
                            </div>
                        </div>
                        {/* {profileData?.gstPercentage ? (
                                <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                    <div className="flex items-center">
                                        <HiOutlineDocumentCurrencyRupee size={30} />
                                        <p>GST %</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="">:</span>
                                        <span className="text-lg font-bold">{profileData?.gstPercentage}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                    <div className="flex items-center">
                                        <HiOutlineDocumentCurrencyRupee size={30} />
                                        <p>GST % is ?</p>
                                    </div>
                                    {showFullMessage && (
                                        <motion.div
                                            initial={{ x: -50, opacity: 0 }} // Start from left
                                            animate={{ x: 0, opacity: 1 }}   // Move to right
                                            transition={{ duration: 0.5, ease: "easeOut" }} // Smooth transition
                                            className="ms-2"
                                        >
                                            <button
                                                onClick={() => navigate("/profile")}
                                                className="flex items-center gap-1 underline"
                                            >
                                                <span>To Add</span> <TbHandClick size={20} />
                                            </button>
                                        </motion.div>
                                    )}
                                </div>)} */}

                        {profileData?.overAllGstToggle === 'on' ? (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>GST</span>
                                <FaToggleOn size={30} onClick={() => handleToggleButton('gstToggle', 'off',)} className="cursor-pointer" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>GST</span>
                                <FaToggleOff size={30} onClick={() => handleToggleButton('gstToggle', 'on')} className="cursor-pointer" />
                            </div>
                        )}
                        {profileData?.customerToggle === 'on' ? (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>Customer</span>
                                <FaToggleOn size={30} onClick={() => handleToggleButton('customerToggle', 'off')} className="cursor-pointer" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>Customer</span>
                                <FaToggleOff size={30} onClick={() => handleToggleButton('customerToggle', 'on')} className="cursor-pointer" />
                            </div>
                        )}
                        {profileData?.employeeToggle === 'on' ? (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>Employee</span>
                                <FaToggleOn size={30} onClick={() => handleToggleButton('employeeToggle', 'off')} className="cursor-pointer" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-3xl bg-white/10 border-primaryColor border-[1.5px] text-primaryColor">
                                <span>Employee</span>
                                <FaToggleOff size={30} onClick={() => handleToggleButton('employeeToggle', 'on')} className="cursor-pointer" />
                            </div>
                        )}
                    </div>
                </div>


                <div className="grid grid-cols-12 gap-5 mt-5 2xl:gap-3">
                    <div className={`grid h-fit  gap-4 ${selectedProducts?.length > 0 ? "col-span-12 lg:col-span-6 xl:col-span-7 2xl:col-span-8  xl:grid-cols-2 grid-cols-1" : "col-span-12  lg:grid-cols-2 2xl:grid-cols-3 grid-cols-1 "}`}>
                        {productCategoryData?.map((idx: any, index: any) => {
                            const filteredItems = filteredItemsMap[index];

                            return (
                                <div
                                    key={index}
                                    className="gap-6 p-3 transition duration-300 border shadow-xl rounded-3xl bg-white/10 border-white/20 backdrop-blur-md hover:shadow-2xl hover:backdrop-blur-lg h-fit"
                                // className="p-3 rounded-3xl bg-gradient-to-tr from-[#222830] to-white/10 backdrop-blur-md  !h-fit w-full"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={idx?.img_url ? idx?.img_url : NoImg}
                                                className="object-cover w-16 h-16 rounded-lg"
                                                alt={NoImg}
                                            />
                                            <div>
                                                <p className="text-white">{idx?.name}</p>
                                                <p className="flex items-center gap-1">
                                                    <span className="text-xs text-white/60">Products :</span>
                                                    <span className="text-white">{idx?.products}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => toggleButton(index)}
                                                className="flex items-center justify-center border rounded-md h-7 w-7 border-primaryColor text-primaryColor hover:bg-primaryColor hover:text-black"
                                            >
                                                {toggleStates[index] ? <FaAngleUp /> : <FaAngleDown />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search + Products */}
                                    {toggleStates[index] && (
                                        <div className="mt-2">
                                            {/* Search */}
                                            <div className="flex justify-center w-full mx-auto">
                                                <input
                                                    type="search"
                                                    placeholder="Search Products Here..."
                                                    value={searchQueries[index] || ""}
                                                    onChange={(e) => handleSearchChange(e, index)}
                                                    className="bg-white/10 px-3 pt-[3px] pb-[6px] rounded-md placeholder:text-white/70 placeholder:text-xs w-full border-[1.5px] text-white border-[#f1f6fd61] outline-none"
                                                />
                                            </div>

                                            {/* Product List */}
                                            {filteredItems?.length > 0 ? (
                                                <div className="flex flex-col gap-3 mt-2 max-h-[300px] !h-fit overflow-y-auto hide-scrollbar">
                                                    {filteredItems.map((item, i) => (
                                                        <div
                                                            key={i}

                                                            className="bg-gradient-to-b from-[#222830] to-[222830] backdrop-blur-3xl rounded-3xl p-3 border-[1px] flex justify-between items-center"
                                                        >
                                                            <div
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={() => handleProductClick(item)}
                                                            >
                                                                <img
                                                                    src={item?.img_url ? item?.img_url : NoImg}
                                                                    className="object-cover w-16 h-16 rounded-2xl"
                                                                    alt={NoImg}
                                                                />
                                                                <div>
                                                                    <div className="flex flex-wrap items-center gap-[6px]">
                                                                        <p className="text-sm font-semibold text-white capitalize">
                                                                            {item?.name?.length > 14 ? item?.name.slice(0, 14) + ".." : item?.name}
                                                                        </p>
                                                                        {item?.productAddedFromStock === 'yes' && (
                                                                            <p className="text-sm font-semibold text-white capitalize">({item?.quantity})</p>
                                                                        )}
                                                                    </div>
                                                                    {item?.productAddedFromStock === 'yes' && (
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            <div className="flex items-center gap-1 px-2 py-1 border rounded-full border-white/50 w-fit">
                                                                                <div className="flex text-xs text-white/70">
                                                                                    <p>Stock</p>
                                                                                    <p>:</p>
                                                                                </div>
                                                                                <p className="text-white flex gap-[2px] text-xs">
                                                                                    {item?.count}
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 px-2 py-1 border rounded-full border-white/50 w-fit">
                                                                                <div className="flex text-xs text-white/70">
                                                                                    <p>Sales</p>
                                                                                    <p>:</p>
                                                                                </div>
                                                                                <p className="text-white flex gap-[2px] text-xs">
                                                                                    {item?.sales}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-col md:flex-row flex-wrap gap-2 mt-[6px] md:gap-[6px]">
                                                                        <div className="flex items-center gap-1 px-2 py-1 border rounded-full border-white/50 w-fit">
                                                                            <div className="flex text-xs text-white/70">
                                                                                <p>Price</p>
                                                                                <p>:</p>
                                                                            </div>
                                                                            <p className="text-white flex gap-[2px] text-xs">
                                                                                <span>₹</span>
                                                                                {item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price}
                                                                            </p>
                                                                        </div>
                                                                        {(profileData?.overAllGstToggle === "on" && item?.isgst) && (
                                                                            <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit border-white/50">
                                                                                <div className="flex text-xs text-white/70">
                                                                                    <p>GST</p>
                                                                                    <p>:</p>
                                                                                </div>
                                                                                <p className="text-white flex gap-[2px] text-xs">
                                                                                    <span>₹</span>
                                                                                    {item?.gstAmount}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end justify-center gap-[6px] !h-full">
                                                                {(item?.productAddedFromStock === 'no' && item?.count === 0) ? (
                                                                    <button
                                                                        onClick={() => handleProductClick(item)}
                                                                        disabled={selectedProducts.some((p) => p._id === item._id)}
                                                                        className={`flex items-center justify-center border rounded-md h-7 w-7 
                                                                          ${(selectedProducts.some((p) => p._id === item._id))
                                                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                                : 'bg-primaryColor text-black border-primaryColor'
                                                                            }`}
                                                                    >
                                                                        <MdAdd />
                                                                    </button>
                                                                ) : (item?.productAddedFromStock === 'yes' && item?.count > 0) ? (
                                                                    <button
                                                                        onClick={() => handleProductClick(item)}
                                                                        disabled={selectedProducts.some((p) => p._id === item._id) || item?.count < 1}
                                                                        className={`flex items-center justify-center border rounded-md h-7 w-7 
                                                                          ${(selectedProducts.some((p) => p._id === item._id) || item?.count < 1)
                                                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                                                : 'bg-primaryColor text-black border-primaryColor'
                                                                            }`}
                                                                    >
                                                                        <MdAdd />
                                                                    </button>
                                                                ) : null}  {/* Hide the button if productAddedFromStock is not 'yes' or count is <= 0 */}

                                                                <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit border-white/50">
                                                                    <div className="flex text-xs text-white/70">
                                                                        <p>Total</p>
                                                                        <p>:</p>
                                                                    </div>
                                                                    <p className="text-white flex gap-[2px] text-xs"><span>₹</span>
                                                                        <span>{(profileData?.overAllGstToggle === 'on' && item?.isgst) ? (
                                                                            ((item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price) + item?.gstAmount).toFixed(2)
                                                                        ) : (
                                                                            (item?.productAddedFromStock === 'yes' ? item?.actualPrice : item?.price).toFixed(2)
                                                                        )}</span></p>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="mt-2 text-xs text-center text-white/60">No products found</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                    <AnimatePresence>
                        {selectedProducts?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: "100%" }} // Start from the right
                                animate={{ opacity: 1, x: "0%" }} // Move to the center
                                exit={{ opacity: 0, x: "100%" }} // Move back to the right on exit
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="col-span-12 px-2 py-4 md:px-3 lg:col-span-6 xl:col-span-5 2xl:col-span-4 rounded-3xl bg-white/95 backdrop-blur-m h-fit"
                            >

                                <div className="">
                                    <div className="flex items-center justify-center gap-1 px-3 py-1 mx-auto mb-3 text-xl bg-primaryColor w-fit rounded-3xl">
                                        <TiInputChecked size={30} />
                                        <p className="font-bold text-center uppercase font-Poppins">Selected Products</p>
                                    </div>

                                    <div className="flex flex-col gap-3 overflow-y-scroll hide-scrollbar max-h-[75vh]">
                                        {selectedProducts?.map((product, index) => (
                                            <div key={index}
                                                className="flex items-center w-full gap-3 2xl:gap-1  bg-gradient-to-b from-[#222830e2] to-[#222830d9] backdrop-blur-xl rounded-3xl p-3 border-[1px] shadow-md"
                                                onClick={() => handleProductClick(product)}>
                                                <img
                                                    src={product?.img_url}
                                                    className="object-cover h-16 rounded-lg w-14"
                                                    alt=""
                                                />
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-sm font-bold text-white">
                                                                {product?.name?.length > 14 ? product?.name.slice(0, 14) + ".." : product?.name}
                                                            </p>
                                                            {product?.productAddedFromStock === 'yes' && (
                                                                <p className="text-sm font-medium text-white">({product?.quantity})</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveClick(product?._id)}
                                                            className="flex items-center justify-center h-6 rounded-md w-7 bg-primaryColor"><MdDeleteOutline /></button>
                                                    </div>
                                                    <div className="flex flex-wrap justify-between gap-2 mt-3 sm:flex-nowrap">
                                                        <div className="flex gap-2 md:gap-1">
                                                            <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit">
                                                                <div className="flex text-xs text-white/70">
                                                                    <p>Price</p>
                                                                    <p>:</p>
                                                                </div>
                                                                <p className="text-white flex gap-[2px] text-xs">
                                                                    <span>₹</span>
                                                                    {product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price}
                                                                </p>
                                                            </div>
                                                            {(profileData?.overAllGstToggle === "on" && product?.isgst) && (
                                                                <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit">
                                                                    <div className="flex text-xs text-white/70">
                                                                        <p>GST</p>
                                                                        <p>:</p>
                                                                    </div>
                                                                    <p className="text-white flex gap-[2px] text-xs">
                                                                        <span>₹</span>
                                                                        {product?.gstAmount}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit">
                                                            <div className="flex text-xs text-white/70">
                                                                <p>Total(per unit)</p>
                                                                <p>:</p>
                                                            </div>
                                                            <p className="text-white flex gap-[2px] text-xs">
                                                                <span>₹</span>
                                                                {(profileData?.overAllGstToggle === 'on' && product?.isgst) ? ((product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price) + product?.gstAmount).toFixed(2) : (product?.productAddedFromStock === 'yes' ? product?.actualPrice : product?.price).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between mt-3">
                                                        <div className="flex items-center justify-between overflow-hidden border-[1px] w-fit gap-2 border-primaryColor rounded-md text-primaryColor  h-fit">
                                                            <button
                                                                onClick={() => handleQuantityChange(product._id, product.quantitySelected - 1)}
                                                                disabled={product.quantitySelected <= 1}
                                                                className={`text-sm font-semibold px-2 py-[6px] hover:bg-primaryColor h-full hover:text-black ${product.quantitySelected === 1 ? "opacity-50 cursor-not-allowed" : ""
                                                                    }`}
                                                            >
                                                                <FaMinus />
                                                            </button>
                                                            <span className="text-sm">{product.quantitySelected || 1}</span>
                                                            {(product?.productAddedFromStock === 'no' && product?.count === 0) ? (
                                                                <button
                                                                    onClick={() => handleQuantityChange(product._id, product.quantitySelected + 1)}
                                                                    className={`h-full px-2 py-[6px] text-sm font-semibold hover:bg-primaryColor hover:text-black `}
                                                                >
                                                                    <FaPlus />
                                                                </button>
                                                            ) : (product?.productAddedFromStock === 'yes' && product?.count > 0) ? (
                                                                <button
                                                                    onClick={() => handleQuantityChange(product._id, product.quantitySelected + 1)}
                                                                    disabled={product.quantitySelected >= product.count || product.count <= 0}
                                                                    className={`h-full px-2 py-[6px] text-sm font-semibold hover:bg-primaryColor hover:text-black ${(product.quantitySelected >= product.count || product.count <= 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    <FaPlus />
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full border-primaryColor w-fit bg-primaryColor">
                                                            <div className="flex text-xs text-black/80">
                                                                <p>Total Price</p>
                                                                <p>:</p>
                                                            </div>
                                                            <p className=" flex gap-[2px] text-xs">
                                                                <span>₹{(profileData?.overAllGstToggle === 'on' && product?.isgst) ?
                                                                    (((product?.productAddedFromStock === 'yes' ? product.actualPrice : product?.price) + product?.gstAmount) * product.quantitySelected).toFixed(2)
                                                                    :
                                                                    ((product?.productAddedFromStock === 'yes' ? product.actualPrice : product?.price) * product.quantitySelected).toFixed(2)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap justify-between gap-2 mt-4">
                                        <div className="flex items-center gap-1 h-fit bg-gradient-to-b from-[#222830e2] to-[#222830d9] px-3 py-2 rounded-3xl w-fit text-white">
                                            <p className="text-white/80">Total Amount <span>:</span></p>
                                            <p className="text-lg font-bold">₹ {totalAmount}</p>
                                        </div>
                                        {(profileData?.customerToggle === 'on' || profileData?.employeeToggle === 'on') ? (
                                            <div className="flex flex-col">
                                                <button
                                                    disabled={profileData?.billPageDetails === 'no'}
                                                    type="button" onClick={() => { setOpenModal(true) }}
                                                    className="px-3 py-2 font-semibold bg-primaryColor rounded-3xl ">Submit</button>
                                                {profileData?.billPageDetails === 'no' && <p onClick={() => navigate('/billPage')} className="flex items-center gap-1 mt-1 text-xs hover:cursor-pointer"><span className="text-lg text-red-500">*</span> BillPage is Not Added, Kindly Add It.</p>}
                                            </div>

                                        ) : (
                                            <div className="flex flex-col">
                                                <button
                                                    disabled={profileData?.billPageDetails === 'no'}
                                                    type="button" onClick={() => handleCreateBill()}
                                                    className="px-3 py-2 font-semibold bg-primaryColor rounded-3xl ">Create Bill & Print</button>
                                                {profileData?.billPageDetails === 'no' && <p onClick={() => navigate('/billPage')} className="flex items-center gap-1 mt-1 text-xs hover:cursor-pointer"><span className="text-lg text-red-500">*</span> BillPage is Not Added, Kindly Add It.</p>}                                                </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                </div>


            </div>

            {(loading || getProductCategoryData?.isLoading || getProductCategoryData?.isFetching || getProfileData.isLoading || getProfileData.isFetching) && <LoaderScreen />}

            {openModal && <CreateBillModal openModal={openModal} handleClose={() => setOpenModal(!openModal)} totalAmount={totalAmount}
                selectedProducts={selectedProducts} clearSelectedProducts={() => setSelectedProducts([])} refetch={() => getProductCategoryData?.refetch()} />}

            {/* <div className="!hidden">
                <BillComponent billData={billData} />
            </div> */}
        </>
    );
};

export default ClientHome;
