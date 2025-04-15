import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import {  useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage, getErrorMessageArray, isFormatDate, isFormatTime } from "../../../utils/helper";
import { useEffect, useState } from "react";
import { getProfileApi } from "../../../api-service/authApi";
import { getBillPageApi, getClientUserApi, getSubRoleApi, postCreateBillApi } from "../../../api-service/client";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import toast from "react-hot-toast";


const CreateBillModal = ({ openModal, handleClose, selectedProducts, totalAmount, clearSelectedProducts, refetch }: any) => {

  console.log('totalAmount',totalAmount);
  console.log('selected products',selectedProducts);
  

  if (!openModal) return null;

  const [loading , setLoading] = useState(false)

  const getProfileData = useQuery({
    queryKey: ["getProfileData"],
    queryFn: () => getProfileApi(),
  });

  const profileData = getProfileData?.data?.data?.result;

  const schema = yup.object({

    customerToggle: yup.boolean(),
    employeeToggle: yup.boolean(),

    // customer: yup.object().shape({
    //   name: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
    //     customerToggle ? schema.required('Customer Name is required.') : schema.optional()
    //   ),
    //   mobile: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
    //     customerToggle ? schema.required('Customer Mobile is required.') : schema.optional()
    //   ),
    // }),

    customerName: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
      customerToggle ? schema.required('Customer Name is required.') : schema.optional()
    ),
    customerMobile: yup.string().when(['customerToggle'], ([customerToggle], schema) =>
      customerToggle ? schema.required('Customer Mobile is required.').test(
        'valid-mobile',
        'Mobile number must be 10 digits',
        (value) => !value || /^[6-9][0-9]{9}$/.test(value) // Only validate if value exists
      ) : schema.optional()
    ),

    employee: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
      employeeToggle ? schema.required('Employee Name is required.') : schema.optional()
    ),
    userType: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
      employeeToggle ? schema.required('UserTpye is required.') : schema.optional()),

    // employee: yup.object().shape({
    //   name: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
    //     employeeToggle ? schema.required('Employee Name is required.') : schema.optional()
    //   ),
    //   mobile: yup.string().when(['employeeToggle'], ([employeeToggle], schema) =>
    //     employeeToggle ? schema.required('Employee Mobile is required.') : schema.optional()
    //   ),
    // }),
  });


  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerToggle: false,
      employeeToggle: false,
      customerName: '',
      customerMobile: '',
      employee: '',
    }
  });

  console.log(errors);


  const watchUserType = watch('userType')
  const watchCustomerToggle = watch('customerToggle')
  const watchEmployeeToggle = watch('employeeToggle')
  const watchEmployee = watch('employee')

  useEffect(() => {
    if (profileData?.customerToggle === 'on') {
      setValue('customerToggle', true)
    } else {
      setValue('customerToggle', false)
    }
    if (profileData?.employeeToggle === 'on') {
      setValue('employeeToggle', true)
    } else {
      setValue('employeeToggle', false)
    }
  }, [profileData, setValue])

  const getSubRoleData = useQuery({
    queryKey: ['getSubRoleData'],
    queryFn: () => getSubRoleApi(``),
  })

  const subRoleDropdown = getSubRoleData.data?.data?.result?.map((item: any) => ({
    value: item?._id, label: item?.name
  }))

  const getClientUsersData = useQuery({
    queryKey: ['getClientUsersData', watchUserType],
    queryFn: () => getClientUserApi(`?subRole=${watchUserType ? watchUserType : ""}`),
    enabled: !!watchUserType
  })

  const clientUsersDropdown = getClientUsersData?.data?.data?.result?.map((item: any) => ({
    value: item?._id, label: item?.fullName, fullData: item
  }))

      const getBillPageData = useQuery({
          queryKey: ["getBillPageData"],
          queryFn: () => getBillPageApi(""),
      });


  const onSubmit = async (data: any) => {

    try {
      setLoading(true)

      const employeeDetails = getClientUsersData?.data?.data?.result?.find((idx: any) => idx?._id === watchEmployee)

      const payload = {
        totalAmount: totalAmount,
        selectedProducts: selectedProducts?.map((idx: any) => {
            // Calculate total and GST amount per product
            const gstAmountPerUnit = profileData?.overAllGstToggle === 'on' ? idx.gstAmount : 0;
            const totalGstAmount = gstAmountPerUnit * idx.quantitySelected; // GST for all units

            return {
                productId: idx?._id,
                quantity: idx?.quantitySelected,
                name: idx?.name,
                price: idx.price,
                actualPrice: idx?.actualPrice,
                profitMargin: idx?.profitMargin,
                gstAmount: totalGstAmount,  // Store total GST per product
                gstWithoutTotal: (idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) * idx.quantitySelected,
                gstWithTotal: profileData?.overAllGstToggle === 'on'
                    ? ((idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) + idx.gstAmount) * idx.quantitySelected
                    : (idx?.productAddedFromStock === 'yes' ? idx?.actualPrice : idx.price) * idx.quantitySelected,
                productAddedFromStock: idx?.productAddedFromStock
            }
        }),
        employee: data?.employee ? data?.employee : '',
        customer: {
          name: data?.customerName ? data?.customerName : '',
          mobile: data?.customerMobile ? data?.customerMobile : ''
        }
    };

      console.log(payload);
      const postApi = await postCreateBillApi(payload)
      if (postApi?.status === 200) {
        toast.success(postApi?.data?.msg)
      
      const billPayload = {
        billNo: postApi?.data?.result?.billNo || "N/A",
        dateTime: postApi?.data?.result?.createdAt,
        totalAmount: payload.totalAmount,
        selectedProducts: payload.selectedProducts,
        employee: employeeDetails,
        customer: payload.customer
      };
      
        // handleClose()
        await getBillPageData.refetch();
      
            // Then print
            handlePrint(billPayload, getBillPageData?.data?.data?.result);
            
        clearSelectedProducts()
      }

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }

  }

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
        refetch();
        handleClose();
  
        // Optional: cleanup the iframe after a second
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  };
      
      const generatePrintContent = (billData:any, billPageData:any) => {
        const totalPrice = billData?.selectedProducts.reduce(
          (sum:any, product:any) =>
            sum +
            ((product?.productAddedFromStock === "yes"
              ? product?.actualPrice
              : product?.price) *
              product.quantity || 0),
          0
        );
      
        const totalGst = billData?.selectedProducts.reduce(
          (sum:any, product:any) => sum + (product.gstAmount || 0),
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
          <div class="!p-0 !pb-2 w-full h-full ${billPageData?.printSize} ${billPageData?.font}">
          <!-- Invoice Info -->
            <div class="grid grid-cols-3 gap-3 text-sm">
              <p class="font-bold text-lg">Invoice</p>
        
              ${billPageData?.invoiceFields?.showInvoiceNo
                ? `<p class="text-center">Bill No: <span class="font-semibold">${billData?.billNo}</span></p>`
                : `<p></p>`
            }
        
             <p class="text-right flex justify-end gap-1 flex-wrap items-center text-xs">
                <span class="flex items-center gap-1">
                    <!-- Calendar Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="!h-4 !w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10m-13 6h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    ${isFormatDate(billData?.dateTime)}
                </span>
                <span className='hidden md:block'>|</span>
                <span class="flex items-center gap-1">
                    <!-- Clock Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${isFormatTime(billData?.dateTime)}
                </span>
                </p>
            </div>
            
            <!-- Header Section -->
            <div class="flex flex-col items-center gap-2 mt-3">
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
                ? `<h1 class="text-2xl font-bold text-center">${billPageData?.header?.businessName}</h1>`
                : ""
            }
        
              ${billPageData?.header?.address
                ? `<p class="text-center text-sm">${billPageData?.header?.address}</p>`
                : ""
            }
            </div>
        
            <!-- Parties -->
            <div class="flex justify-between mt-4 text-sm">
              ${profileData?.customerToggle === 'on'
                ? `<div>
                    <p class="font-medium text-base">Customer Details</p>
                    <div className='flex flex-col gap-1'>
                    <p className='text-sm'>Name: <span class="font-semibold">${billData?.customer?.name || ""}</span></p>
                    <p className='text-sm'>Mobile: <span class="font-semibold">${billData?.customer?.mobile || ""}</span></p>
                    </div>
                  </div>`
                : ""
            }
        
              ${profileData?.employeeToggle === 'on'
                ?
                `<div>
                    <p class="font-medium text-base">Employee Details</p>
                    <div className='flex flex-col gap-1'>
                    <p className='text-sm'>Name: <span class="font-semibold">${billData?.employee?.fullName || ""}</span></p>
                    <p className='text-sm'>Mobile: <span class="font-semibold">${billData?.employee?.unquieId || ""}</span></p>
                    </div>
                  </div>`
                : ""
            }
            </div>
        
            <!-- Title -->
            <hr class="my-1 border-dashed border-black/80" />
            <h2 class="text-center font-semibold text-lg">Cash Bill</h2>
            <hr class="my-1 border-dashed border-black/80" />
        
                <!-- Table -->
            <table class="w-full border border-collapse text-xs mt-2 border-black/50">
              <thead>
                <tr class="bg-gray-400">
                  <th class="p-1 border border-black/50">S.No</th>
                  <th class="p-1 border border-black/50">Product</th>
                  <th class="p-1 border border-black/50">Price</th>
                  <th class="p-1 border border-black/50">Qty</th>
                  <th class="p-1 border border-black/50">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${billData?.selectedProducts?.map((item: any, index: any) => {
                const price = item.productAddedFromStock === "yes" ? item.actualPrice : item.price;
                const amount = price * item.quantity;
                return `
                    <tr>
                      <td class="p-1 border border-black/50 text-center">${index + 1}</td>
                      <td class="p-1 border border-black/50 text-center !whitespace-normal">${item.name}</td>
                      <td class="p-1 border border-black/50 text-center whitespace-nowrap">₹ ${price.toLocaleString("en-IN")}</td>
                      <td class="p-1 border border-black/50 text-center">${item.quantity}</td>
                      <td class="p-1 border border-black/50 text-center whitespace-nowrap">₹ ${amount.toLocaleString("en-IN")}</td>
                    </tr>
                  `;
            }).join("")}
              </tbody>
              <tfoot class="font-medium">
                ${profileData?.overAllGstToggle === "on"
                ? `
                      <tr>
                        <td colspan="4" class="p-1 border border-black/50 text-right pr-2">Sub Total</td>
                        <td class="p-1 border text-center border-black/50 whitespace-nowrap">₹ ${totalPrice.toLocaleString("en-IN")}</td>
                      </tr>
                      <tr>
                        <td colspan="4" class="p-1 border border-black/50 text-right pr-2">GST (${profileData?.gstPercentage}%)</td>
                        <td class="p-1 border text-center border-black/50 whitespace-nowrap">₹ ${totalGst.toLocaleString("en-IN")}</td>
                      </tr>
                    `
                : ""
            }
                <tr class="font-semibold text-base">
                  <td colspan="4" class="p-1 border border-black/50 text-right pr-2">Total</td>
                  <td class="p-1 border text-center border-black/50 whitespace-nowrap">₹ ${Number(billData?.totalAmount).toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
        
            ${billPageData?.footer?.terms
                ? `<p class="text-center text-xs mt-4">${billPageData?.footer?.terms}</p>`
                : ""
            }
            <p class="!my-2 text-[11px] !text-center">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
          </div>
        </body>
        </html>
        `;      
      };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-[2px] ">
        <div className="bg-white/20 backdrop-blur-2xl  rounded-lg max-w-xl w-full flex flex-col max-h-[90%]  overflow-hidden border-[1.5px] border-white/50">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-b-white/40">
            <h2 className="text-lg font-semibold text-white font-Montserrat">Create Bill</h2>
            <button
              type="button"
              className="text-white/80 hover:text-primaryColor hover:scale-105"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-full px-4 pt-4 pb-5 overflow-y-auto hide-scrollbar">
            <form className="grid grid-cols-12 gap-4" onSubmit={handleSubmit(onSubmit)}>
              {watchEmployeeToggle && (
                <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg ">
                  <p className="text-white/80 ">Employee Details</p>
                  <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                    <div className="">
                      <p className="mb-1 text-white/80 font-OpenSans">
                        User Type <span className="text-primaryColor">*</span>
                      </p>
                      <div className="relative overflow-hidden">
                        <select
                          {...register("userType")}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose User Type</option>
                          {subRoleDropdown?.map((option: any) => (
                            <option key={option.value} value={option.value} className="bg-gray-400 text-white/80">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      {errors.userType && (
                        <p className="mt-1 text-xs font-medium text-primaryColor">
                          {getErrorMessageArray(errors.userType)}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <p className="mb-1 text-white/80 font-OpenSans">
                        User <span className="text-primaryColor">*</span>
                      </p>
                      <div className="relative overflow-hidden">
                        <select
                          {...register("employee")}
                          disabled={!watchUserType}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose User</option>
                          {clientUsersDropdown?.map((option: any) => (
                            <option key={option.value} value={option.value} className="bg-gray-400 text-white/80">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      {errors.employee && (
                        <p className="mt-1 text-xs font-medium text-primaryColor">
                          {getErrorMessageArray(errors.employee)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {
                watchCustomerToggle && (
                  <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg ">
                    <p className="text-white/80 ">Customer Details</p>
                    <div className="grid grid-cols-1 gap-3 mt-2 md:grid-cols-2">
                      <div className="">
                        <p className="mb-1 text-white/80 font-OpenSans">Name <span className="text-primaryColor">*</span></p>
                        <input type="text"
                          placeholder="Enter Name"
                          className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                          {...register('customerName')}
                        />
                        {errors.customerName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.customerName)}</p>}
                      </div>
                      <div className="">
                        <p className="mb-1 text-white/80 font-OpenSans">Mobile <span className="text-primaryColor">*</span></p>
                        <input type="text"
                          placeholder="Enter Mobile Number"
                          className="rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                          {...register('customerMobile')}
                          onInput={(e) => {
                            const input = e.currentTarget.value;
                            const cleanedInput = input.replace(/\D/g, '');
                            if (/^[6-9][0-9]{0,9}$/.test(cleanedInput)) {
                              e.currentTarget.value = cleanedInput;
                            } else {
                              e.currentTarget.value = cleanedInput.slice(0, -1);
                            }
                          }}
                          maxLength={10}
                        />
                        {errors.customerMobile && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.customerMobile)}</p>}
                      </div>
                    </div>
                  </div>
                )
              }
              <div className="flex items-end justify-end col-span-12 mt-4">
                <button type="submit" className="px-3 py-2 rounded-md bg-primaryColor hover:bg-white/20 hover:text-primaryColor border-[1.5px] hover:border-primaryColor transform transition-all duration-200 ease-linear">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      
                    
      {(loading || getSubRoleData.isLoading || getSubRoleData.isFetching || getClientUsersData.isLoading || getClientUsersData.isFetching) && <LoaderScreen />}

  
    </>
  )
}

export default CreateBillModal