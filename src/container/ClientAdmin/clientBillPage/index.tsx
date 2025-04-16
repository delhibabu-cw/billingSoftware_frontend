import { useEffect, useState } from "react";
import { getBillPageApi, postBillPageApi, putBillPageApi, singleUploadApi } from "../../../api-service/client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { getErrorMessage } from "../../../utils/helper";
import { BsEye, BsFillPhoneVibrateFill } from "react-icons/bs";
import { BiUpload, BiXCircle } from "react-icons/bi";
import DocumentViewer from "../../../components/documentViewer";
import toast from "react-hot-toast";
import LoaderScreen from "../../../components/animation/loaderScreen/LoaderScreen";
import { useQuery } from "@tanstack/react-query";
import { getProfileApi } from "../../../api-service/authApi";
import { MdAccessTime, MdDateRange } from "react-icons/md";

const ClientBillPage = () => {

  const getProfileData = useQuery({
    queryKey : ['getProfileData'],
    queryFn : () => getProfileApi()
  })

    const profileData = getProfileData?.data?.data?.result
    
  const getBillPageData = useQuery({
    queryKey : ['getBillPageData'],
    queryFn : () => getBillPageApi(``),
    enabled: profileData?.billPageDetails === 'yes'
  })

    const billPageData = getBillPageData?.data?.data?.result
    
  const [documentItem, setDocumentItem] = useState({})
  const [documentModal, setDocumentModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const schema = yup.object({
    title: yup.string().default(''),
    logo_Url: yup.string().default(''),
    logoCircle: yup.boolean().default(false),
    logoZoom: yup.boolean().default(false),
    logoWidth: yup.string().default(''),
    logoHeight: yup.string().default(''),
    address: yup.string().default(''),
    contact: yup.string().default(''),
    showInvoiceNo: yup.boolean().default(false),
    signature: yup.string().default(''),
    terms: yup.string().default(''),
    printSize: yup.string().required('This Field is required.'),
    font: yup.string().optional(),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      font: "font-Poppins", // 👈 Default font set here
    },
  });

  // const watchShowLogo = watch('showLogo')
  const watchLogo = watch('logo_Url')
  const watchLogoZoom = watch('logoZoom')
  const watchTitle = watch('title')
  const watchAddress = watch('address')
  const watchLogoCircle = watch('logoCircle')
  const watchLogoWidth = watch('logoWidth')
  const watchLogoHeight = watch('logoHeight')
  const watchShowBillNo = watch('showInvoiceNo')
  const watchSignature = watch('signature')
  const watchTerms = watch('terms')
  const watchFont = watch('font')
  const watchContact = watch('contact')

  const handleSingleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, title: any) => {
    const file = e.target.files?.[0]; // Get the first selected file

    console.log(title);

    // Allowed file types
    const allowedFileTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/x-png',
      // 'application/pdf', 'application/vnd.ms-excel',
      // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // 'application/vnd.ms-powerpoint', 'video/mp4', 'text/plain'
    ];

    // Validate file
    if (!file) return toast.error('No file selected.');
    if (!allowedFileTypes.includes(file.type)) return toast.error(`Invalid file type: ${file.type}`);
    if (file.size > 2 * 1024 * 1024) return toast.error('File size exceeds 2MB.');

    try {
      setLoading(true);

      // Prepare FormData
      const formData = new FormData();
      formData.append('file', file);

      // API Call
      const uploadData = await singleUploadApi(formData);

      // Handle API response
      if (uploadData?.data?.result?.location) {
        const uploadedFileURL = uploadData.data.result.location;
        if (title === 'logo') {
          setValue('logo_Url', uploadedFileURL);
        } else if (title === 'signature') {
          setValue('signature', uploadedFileURL);
        }
        // Update form state
        toast.success(uploadData?.data?.msg || 'File uploaded successfully.');
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('File upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // const handlePrint = () => {
  //   window.print();
  // };

  const onSubmit = async (data : any)=>{
   try{
    setLoading(true)
    const payload = {
      header : {
        businessName : data?.title,
        address : data?.address,
        contact : data?.contact,
        logo : {
          logo_Url : data?.logo_Url,
          logoCircle : data?.logoCircle,
          logoZoom : data?.logoZoom,
          logoWidth : data?.logoWidth,
          logoHeight : data?.logoHeight
        }
      },
        invoiceFields : {
          showInvoiceNo : data?.showInvoiceNo,
        },
        footer : {
          signature : data?.signature,
          terms : data?.terms
        },
        printSize : data?.printSize,
        font : data?.font
    }

    // console.log(payload);
    
    if(profileData?.billPageDetails === 'no'){
      const postApi = await postBillPageApi(payload)
      if(postApi?.status === 200){
        toast.success(postApi?.data?.msg)
        getProfileData?.refetch()
      }
    }else{
      const putApi = await putBillPageApi(payload, billPageData?._id)
      if(putApi?.status === 200){
        toast.success(putApi?.data?.msg)
        getProfileData?.refetch()
        getBillPageData?.refetch()
      }
    }  

   }catch(err){
    console.log(err)    
   }finally{
    setLoading(false)
   }
  }


  useEffect(()=>{
    if(billPageData){
      setValue('title', billPageData?.header?.businessName)
      setValue('address', billPageData?.header?.address)
      setValue('contact', billPageData?.header?.contact)
      setValue('logo_Url', billPageData?.header?.logo.logo_Url)
      setValue('logoCircle', billPageData?.header?.logo.logoCircle)
      setValue('logoZoom', billPageData?.header?.logo.logoZoom)
      setValue('logoHeight', billPageData?.header?.logo.logoHeight)
      setValue('logoWidth', billPageData?.header?.logo.logoWidth)
      setValue('logoWidth', billPageData?.header?.logo.logoWidth)
      setValue('showInvoiceNo', billPageData?.invoiceFields?.showInvoiceNo)
      setValue('signature', billPageData?.footer?.signature)
      setValue('terms', billPageData?.footer?.terms)
      setValue('printSize', billPageData?.printSize)
      setValue('font', billPageData?.font)
    }
  },[billPageData, setValue])

  return (
    <>
      <div className={`grid grid-cols-12 gap-4 pt-24 lg:pt-32 px-[4%] pb-10`}>
        {/* Left Side - Print Settings */}
        <div className="h-full col-span-12 p-4 rounded-md shadow-md lg:col-span-6 xl:col-span-5 bg-white/10">
          <h2 className="mb-2 text-lg font-bold text-white">Print Settings</h2>
          <form className="grid max-h-screen grid-cols-12 gap-4 overflow-y-auto hide-scrollbar"
          onSubmit={handleSubmit(onSubmit)}>

            <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg h-fit">
              <p className="px-2 py-1 bg-primaryColor w-fit rounded-3xl">Header Details</p>
              <div className="grid grid-cols-12 gap-3 mt-2 ">
                <div className="col-span-12 lg:col-span-6">
                  <p className="mb-1 text-white/80 ">Title</p>
                  <input type="text"
                    placeholder="Enter Title"
                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                    {...register('title')}
                  />
                  {errors.title && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.title)}</p>}
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <p className="mb-1 text-white/80 ">Address</p>
                  <input type="text"
                    placeholder="Enter Address"
                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                    {...register('address')}
                  />
                  {errors.address && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.address)}</p>}
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <p className="mb-1 text-white/80 ">Contact</p>
                  <input type="text"
                    placeholder="Enter Contact No"
                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                    {...register('contact')}
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
                  {errors.contact && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.contact)}</p>}
                </div>
                <div className="flex flex-col col-span-12 gap-2 p-3 rounded-md bg-white/10 backdrop-blur-lg h-fit">
                  <p className="w-fit text-white/80">Logo</p>
                  {/* <label className="w-fit  bg-white/10 backdrop-blur-md rounded-md px-3 py-[6px] text-white/80 cursor-pointer">
                      <input type="checkbox" className=""
                        {...register('showLogo')} /> Logo
                    </label> */}
                  {/* {watchShowLogo && ( */}
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <div className="h-fit border-dashed border-primaryColor border-[2px] !border-spacing-10 rounded-md flex justify-center items-center  py-6">
                      {watchLogo ? (
                        <div className="flex flex-wrap justify-center gap-3 overflow-hidden">
                          <div className="flex flex-col items-center gap-3">
                            {/* Display file name */}
                            {watchLogo && (
                              <span
                                className="max-w-xs text-xs font-medium truncate text-white/70"
                                title={watchLogo} // Show full file name on hover
                              >
                                {watchLogo.split('/').pop()} {/* Extract only the file name */}
                              </span>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDocumentItem({
                                    val: watchLogo,
                                    key: watchLogo?.endsWith('.pdf') ? 'document' : 'image',
                                    title: 'Logo'
                                  });
                                  setDocumentModal(true);
                                }}
                                type="button"
                                className="flex items-center justify-center gap-2 px-2 py-1 text-black rounded-md bg-primaryColor w-fit"
                              >
                                View <BsEye />
                              </button>
                              <button
                                onClick={() => {
                                  setValue('logo_Url', ''); // Clear the uploaded file
                                  setValue('logoCircle', false)
                                  setValue('logoZoom', false)
                                  setValue('logoWidth', '')
                                  setValue('logoHeight', '')
                                }}
                                className="flex items-center gap-1 px-1 text-sm text-white border rounded-md cursor-pointer hover:bg-primaryColor hover:text-black">
                                Remove
                                <BiXCircle
                                  className=""

                                />
                              </button>

                            </div>
                          </div>

                        </div>
                      ) : (
                        <div>
                          <label className="flex flex-col items-center justify-center text-[#2B2B2D] cursor-pointer" htmlFor={`productImage`}>
                            <BiUpload className="w-9 h-9 text-[#C5C5C5]" />
                            <p className="text-[#C5C5C5] ">Upload Logo</p>
                          </label>
                          <input
                            id={`productImage`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleSingleUploadImage(e, 'logo')}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="relative overflow-hidden">
                        <select
                          {...register("logoWidth")}
                          disabled={!watchLogo}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose Logo Width</option>
                          <option className="bg-gray-400 text-white/80" value="w-[150px]">150</option>
                          <option className="bg-gray-400 text-white/80" value="w-[200px]">200</option>
                          <option className="bg-gray-400 text-white/80" value="w-[250px]">250</option>
                          <option className="bg-gray-400 text-white/80" value="w-[300px]">300</option>
                          <option className="bg-gray-400 text-white/80" value="w-[300px]">350</option>
                          <option className="bg-gray-400 text-white/80" value="w-[400px]">400</option>
                          <option className="bg-gray-400 text-white/80" value="w-[450px]">450</option>
                          <option className="bg-gray-400 text-white/80" value="w-[500px]">500</option>
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      <div className="relative overflow-hidden">
                        <select
                          {...register("logoHeight")}
                          disabled={!watchLogo}
                          className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="" disabled hidden>Choose Logo Height</option>
                          <option className="bg-gray-400 text-white/80" value="h-[144px]">144</option>
                          <option className="bg-gray-400 text-white/80" value="h-[160px]">160</option>
                          <option className="bg-gray-400 text-white/80" value="h-[176px]">176</option>
                          <option className="bg-gray-400 text-white/80" value="h-[192px]">192</option>
                        </select>
                        <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                          ▼
                        </div>
                      </div>
                      <label className="w-full  bg-white/10 backdrop-blur-md rounded-md px-3 py-[6px] text-white/80 cursor-pointer">
                        <input type="checkbox" className=""
                          disabled={!watchLogo}
                          {...register('logoCircle')} /> Logo Circle
                      </label>
                      <label className="w-full  bg-white/10 backdrop-blur-md rounded-md px-3 py-[6px] text-white/80 cursor-pointer">
                        <input type="checkbox" className=""
                          disabled={!watchLogo}
                          {...register('logoZoom')} /> Logo Zoom
                      </label>
                    </div>
                  </div>
                  {/* )} */}
                </div>

              </div>
            </div>

            <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg h-fit">
              <p className="px-2 py-1 bg-primaryColor w-fit rounded-3xl">Invoice Details</p>
              <div className="grid grid-cols-12 gap-3 mt-2 ">
                <label className="w-full col-span-6  bg-white/10 backdrop-blur-md rounded-md px-3 py-[6px] text-white/80 cursor-pointer">
                  <input type="checkbox" className=""
                    {...register('showInvoiceNo')} /> Show BillNo
                </label>
              </div>
            </div>
            <div className="col-span-12 p-3 rounded-md bg-white/15 backdrop-blur-lg h-fit">
              <p className="px-2 py-1 bg-primaryColor w-fit rounded-3xl">Invoice Details</p>
              <div className="grid grid-cols-12 gap-3 mt-2 ">
                <div className="col-span-12 lg:col-span-6">
                  <p className="mb-1 text-white/80 ">Terms</p>
                  <input type="text"
                    placeholder="Enter Terms"
                    className=" rounded-md px-3 py-[6px]  w-full bg-white/10 backdrop-blur-md outline-none placeholder:text-white/90 placeholder:text-sm border-[1.5px] border-white/40 text-white"
                    {...register('terms')}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <label htmlFor="contact-lead-score" className="mb-1 text-white/80 ">Signature</label>
                  <div className="min-h-fit border-dashed border-primaryColor border-[2px] !border-spacing-10 rounded-md flex justify-center items-center mt-2 py-6">
                    {watchSignature ? (
                      <div className="flex flex-wrap justify-center gap-3 overflow-hidden">
                        <div className="flex flex-col items-center gap-3">
                          {/* Display file name */}
                          {watchSignature && (
                            <span
                              className="max-w-xs text-xs font-medium truncate text-white/70"
                              title={watchSignature} // Show full file name on hover
                            >
                              {watchSignature.split('/').pop()} {/* Extract only the file name */}
                            </span>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setDocumentItem({
                                  val: watchSignature,
                                  key: watchSignature?.endsWith('.pdf') ? 'document' : 'image',
                                  title: 'Profile Image'
                                });
                                setDocumentModal(true);
                              }}
                              type="button"
                              className="flex items-center justify-center gap-2 px-2 py-1 text-black rounded-md bg-primaryColor w-fit"
                            >
                              View <BsEye />
                            </button>
                            <BiXCircle
                              className="text-white cursor-pointer"
                              onClick={() => {
                                setValue('signature', ''); // Clear the uploaded file
                              }}
                            />
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div>
                        <label className="flex flex-col items-center justify-center text-[#2B2B2D] cursor-pointer" htmlFor={`signature`}>
                          <BiUpload className="w-9 h-9 text-[#C5C5C5]" />
                          <p className="text-[#C5C5C5] ">Upload Signature Image</p>
                        </label>
                        <input
                          id={`signature`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleSingleUploadImage(e, 'signature')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-6">
                  <p className="mb-1 text-white/80 ">PrintSize <span className="text-primaryColor">*</span></p>
                  <div className="relative col-span-6 overflow-hidden">
                    <select
                      {...register("printSize")}
                      className="appearance-none rounded-md px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled hidden>Choose PrintSize</option>
                      <option className="bg-gray-400 text-white/80" value="58mm">58mm</option>
                      <option className="bg-gray-400 text-white/80" value="80mm">80mm</option>
                      <option className="bg-gray-400 text-white/80" value="110mm">110mm</option>
                      <option className="bg-gray-400 text-white/80" value="210mm">210mm</option>
                    </select>
                    <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                      ▼
                    </div>
                  </div>
                  {errors.printSize && <p className="mt-1 text-xs text-primaryColor">{getErrorMessage(errors.printSize)}</p>}
                </div>
                <div className="col-span-12 md:col-span-6">
                  <p className="mb-1 text-white/80">Font <span className="text-primaryColor">*</span></p>
                  <div className="relative col-span-6 overflow-hidden">
                    <select
                      {...register("font")}
                      className="appearance-none rounded-md  px-3 py-[6px] w-full bg-white/10 text-white outline-none border-[1.5px] border-white/40 cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled hidden>Choose Font</option>
                      <option className="bg-gray-400 text-white/80" value="font-Poppins">Poppins</option>
                      <option className="bg-gray-400 text-white/80" value="font-Alice">Alice</option>
                      <option className="bg-gray-400 text-white/80" value="font-OpenSans">OpenSans</option>
                      <option className="bg-gray-400 text-white/80" value="font-Montserrat">Montserrat</option>
                      <option className="bg-gray-400 text-white/80" value="font-inter">Inter</option>
                    </select>
                    <div className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-3">
                      ▼
                    </div>
                  </div>
                  {errors.font && <p className="mt-1 text-xs text-primaryColor">{getErrorMessage(errors.font)}</p>}
                </div>
                
              </div>

            </div>
            <div className="flex items-center justify-end col-span-12">
                  <button className="px-3 py-2 rounded-md bg-primaryColor h-fit" type="submit">{profileData?.billPageDetails === "no" ? "Submit" : "  Update"}</button>
                </div>
          </form>
        </div>

        {/* Right Side - Invoice Preview */}
        <div className={`col-span-12 lg:col-span-6 xl:col-span-7 p-2 md:p-4 border rounded-md shadow-md bg-white/95 h-full overflow-y-auto hide-scrollbar ${watchFont}`} id="printArea">
          <div className="grid grid-cols-3 gap-3">
            <p className="text-xl font-bold ">Invoice</p>
            {watchShowBillNo ? (
                                <p className="text-sm text-center">Bill No: <span className="text-base font-semibold"></span></p>
                              ) : (<p></p>)}

                     <p className="text-[12px] text-end">
                                                    <span className='flex flex-wrap items-center justify-end gap-1'>
                                                        <span className='flex flex-wrap items-center justify-center gap-1'><MdDateRange className='text-lg'/></span>
                                                         <span className='hidden md:block'>|</span>
                                                         <span className='flex flex-wrap items-center justify-center gap-1'><MdAccessTime className='text-lg'/></span>
                                                         </span>
                                                         </p>
        
          </div>

          <div className="flex flex-col items-center justify-center gap-1 mt-3">
            {watchLogo && (
              <img
                src={watchLogo}
                className={`${watchLogoWidth === '' ? 'w-36' : `${watchLogoWidth} object-cover`} ${watchLogoCircle ? 'rounded-full' : 'rounded'} 
                ${watchLogoHeight === '' ? "h-36" : `${watchLogoHeight}`} ${watchLogoZoom ? 'object-cover' : 'object-fill'} shadow-lg `}
                alt=""
              />
            )}
            {watchTitle && (
              <p className="max-w-md mt-4 text-xl font-bold text-center md:text-2xl ">{watchTitle}</p>
            )}
            {watchAddress && (
              <p className="flex flex-wrap w-full !max-w-md mt-2 font-medium text-sm justify-center md:text-base text-center ">{watchAddress}</p>
            )}
            {watchContact && (
              <p className="flex flex-wrap w-full !max-w-md  font-medium text-sm justify-center md:text-base text-center items-center gap-1"><BsFillPhoneVibrateFill />{watchContact}</p>
            )}
          </div>

          <div className="flex justify-between mt-2">
            {(profileData?.customerToggle === 'on') && (
              <div>
                <p className="text-lg font-medium">Customer Details</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <p>Name :</p>
                  <p className="font-semibold ">xyz</p>
                </div>
                <div className="flex items-center gap-2 mt-[2px] text-sm">
                  <p>Mobile :</p>
                  <p className="font-semibold ">1234567890</p>
                </div>
              </div>
            )}
            {(profileData?.employeeToggle === 'on') && (
              <div>
                <p className="text-lg font-medium">Employee Details</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <p>Name :</p>
                  <p className="font-semibold ">abc</p>
                </div>
                <div className="flex items-center gap-2 mt-[2px] text-sm">
                  <p>Mobile :</p>
                  <p className="font-semibold ">1234567890</p>
                </div>
              </div>
            )}
          </div>

          <hr className="mt-2 border border-collapse border-dashed border-black/80 border-x-8" />
          <p className="py-1 text-xl font-semibold text-center">Bill</p>
          <hr className="mb-2 border border-collapse border-dashed border-black/80 border-x-8" />
          <table className="w-full mt-4 border border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">S.No</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* {billData?.selectedProducts?.map((item: any, index: any) => ( */}
              <tr >
                <td className="p-2 border">1.</td>
                <td className="p-2 border">sample</td>
                <td className="p-2 border">1</td>
                <td className="p-2 border">0</td>
                <td className="p-2 border">0</td>
              </tr>
              {/* ))} */}
            </tbody>

            <tfoot>
              {profileData?.overAllGstToggle === 'on' && (
                <>
                  <tr className="">
                    <td className="p-2 text-sm font-medium border" colSpan={4}>Sub Total</td>
                    <td className="p-2 text-sm font-medium border" colSpan={1}>₹ 0</td>
                  </tr>
                  <tr className="">
                    <td className="p-2 text-sm font-medium border" colSpan={4}>GST(0%)</td>
                    <td className="p-2 text-sm font-medium border" colSpan={1}>₹ 0</td>
                  </tr>
                </>
              )}
              <tr className="">
                <td className="p-2 text-sm font-semibold border" colSpan={4}>Total</td>
                <td className="p-2 text-sm font-bold border" colSpan={1}>₹ 0</td>
              </tr>
            </tfoot>

          </table>
          {watchSignature != '' ? (
          <div className="grid w-full grid-cols-2 gap-3 mt-3 md:grid-cols-3">
            <div className="hidden md:block"></div>
          <div>
            {watchTerms && (
              <p className="flex items-center justify-center h-full max-w-sm text-xs font-semibold capitalize md:text-center md:text-sm">{watchTerms}</p>
            )}
          </div>
          <div>
            {watchSignature && (
              <img src={watchSignature} className="object-cover w-20 ml-auto border rounded h-14 md:h-20 md:w-36" alt="" />
            )}
          </div>
        </div>  
          ) : (
            watchTerms && (
              <p className="flex justify-center mt-2 text-xs font-semibold text-center capitalize md:text-sm">{watchTerms}</p>
            )
          )}
          
          <p className="mt-2 text-[11px] text-center ">Billing Partner CORPWINGS IT SERVICE , 6380341944</p>
        </div>
      </div>

      <DocumentViewer
        open={documentModal}
        handleModal={() => setDocumentModal(!documentModal)}
        document={documentItem}
      />

      {(loading || getProfileData.isLoading || getProfileData.isFetching || getBillPageData.isLoading 
      || getBillPageData.isFetching) && <LoaderScreen />}
    </>


  );
};

export default ClientBillPage;
