import { useNavigate } from "react-router-dom"
import logo from "../../assets/images/logo/originalLogo.png"
import { useEffect, useState } from "react";
import { Controller, Resolver, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { getErrorMessage } from "../../utils/helper";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { getAuthRoleApi, postSigninApi } from "../../api-service/authApi";
import toast from "react-hot-toast";
import LoaderScreen from "../../components/animation/loaderScreen/LoaderScreen"
import { useQuery } from "@tanstack/react-query";
import bgImg from "../../assets/images/login/1746057.png"

const Login = () => {

  const [passwordshow1, setpasswordshow1] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const getRoleData = useQuery({
    queryKey: ['getRoleData'],
    queryFn: () => getAuthRoleApi(``)
  })

  const roleDropdown = getRoleData.data?.data?.result?.map((item: any) => (
    { value: item?._id, label: item?.name }
  ))

  interface LoginFormData {
    userName: string;
    password: string;
    navigate?: any;
    device_id?: string;
    role: string;
  }

  const schema = yup.object().shape({
    userName: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    navigate: yup.string().optional(),
    device_id: yup.string().optional(),
    role: yup.string().required('Role is required'),
  });

  const {
    handleSubmit,
    register,
    setValue,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<LoginFormData>,
  });

  const [rememberPassword, setRememberPassword] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem('rememberPassword') === 'true';
    const userName = localStorage.getItem('userName');
    const password = localStorage.getItem('password');
    setRememberPassword(savedPreference);
    setValue('userName', userName || '');
    setValue('password', password || '');
  }, [setValue]);

  const handleCheckboxChange = (e: any) => {
    const isChecked = e.target.checked;
    setRememberPassword(isChecked);
    localStorage.setItem('rememberPassword', isChecked.toString());
  };

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setError('');

    if (rememberPassword) {
      localStorage.setItem('userName', data.userName);
      localStorage.setItem('password', data.password);
    }

    const payload = {
      ...data,
      device_id: '123',
    };

    try {
      setLoading(true); // Start loading

      const updateApi = await postSigninApi(payload);
      console.log(updateApi);

      if (updateApi?.status === 200) {

        localStorage.setItem('access-token', updateApi?.data?.result.tokens.accessToken);
        localStorage.setItem('role', btoa(updateApi?.data?.result.user.role.name));
        localStorage.setItem('refreshToken', updateApi?.data?.result.tokens.refreshToken);
        localStorage.setItem('userId', updateApi?.data?.result?.user._id);
        localStorage.setItem('name', updateApi?.data?.result?.user?.fullName);
        
      if(updateApi?.data?.result.user.role.name === 'SUPERADMIN'){
        navigate('/clients');
      }else{
        navigate('/home');
      }
        
        toast.success(updateApi?.data?.msg);

        // window.location.reload()
      } else {
        setError('Invalid Username or Password.');
        toast.remove();
      }
    } catch (error) {
      console.error("Failed to login:", error);
      setError("Failed to login. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <>
   
      <div className=" inset-0 flex justify-center items-center h-full md:!h-[100vh] bg-[#1D2125] relative">
      <img src={bgImg} className="absolute object-cover w-full h-full" alt="" />
        <div className="absolute top-0 left-0 bg-white h-[5px] 2xl:h-[50px] w-full rounded-b-lg blur-[160px] 2xl:blur-[170px]"></div>
        <div className="absolute bottom-0 left-0 bg-white h-full w-[30px] 2xl:w-[35px] rounded-s-lg blur-[160px] 2xl:blur-[200px]"></div>
        <form onSubmit={handleSubmit(onSubmit)} className="">
          <div className="w-full p-4 border shadow-lg bg-black/30 md:p-6 md:max-w-md backdrop-blur-md rounded-2xl border-white/20 hide-scrollbar">
            <img src={logo} className="w-[200px] mx-auto" alt="" />
            <h2 className="mb-4 text-2xl font-extrabold text-center text-white uppercase md:text-3xl mt-7 font-Alice ">Billing Software</h2>
            <div className="grid grid-cols-12 mt-5 gap-y-2 2xl:gap-y-3">
              <div className="col-span-12 xl:col-span-12">
                <label htmlFor="signin-username" className="form-label text-default text-[#c2c5c9] text-base font-inter">User Name</label>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-2 mt-2 text-white placeholder-gray-300 rounded-lg outline-none bg-white/20"
                  {...register('userName')}
                />
                {errors.userName && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.userName)}</p>}
              </div>
              <div className="col-span-12 xl:col-span-12">
                <label htmlFor="signin-password" className="form-label text-default block text-[#c2c5c9] text-base">Password</label>
                <div className="relative">
                  <input
                    type={passwordshow1 ? 'text' : 'password'}
                    className="w-full px-4 py-2 mt-2 text-white placeholder-gray-300 rounded-lg outline-none bg-white/20"
                    id="signin-password"
                    placeholder="password"
                    {...register('password')}
                  />
                  <button
                    onClick={() => setpasswordshow1(!passwordshow1)}
                    className="absolute top-[60%] right-3 transform translate-y-[-50%] !rounded-s-none cursor-pointer text-white"
                    type="button"
                    id="button-addon2"
                  >
                    {passwordshow1 ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs font-medium text-primaryColor">{getErrorMessage(errors.password)}</p>}
              </div>

              <div className="col-span-12 xl:col-span-12">
                <p className="mb-1 text-white/80 font-OpenSans">
                  Role
                </p>

                <Controller
                  control={control}
                  name="role"
                  defaultValue="" // Ensures "Choose a Role" is selected by default
                  render={({ field }) => (
                    <select
                      {...field}
                      className="rounded-md px-3 py-[9px] w-full bg-white/10 backdrop-blur-md outline-none border-[1.5px] border-white/40 text-white text-sm "
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="" disabled>
                        Choose a Role
                      </option>
                      {roleDropdown?.map((option: any) => (
                        <option key={option.value} value={option.value} className="text-black">
                          {option.label}
                        </option>
                      ))}
                    </select>

                  )}
                />

                {errors.role && (
                  <p className="mt-1 text-xs font-medium text-primaryColor">
                    {errors.role.message}
                  </p>
                )}
              </div>
              <div className="col-span-12 mb-3 xl:col-span-12">
                <div className="flex items-center justify-between">
                  <div className="form-check !ps-0 flex gap-1">
                    <input
                      className="cursor-pointer form-check-input"
                      type="checkbox"
                      checked={rememberPassword}
                      onChange={handleCheckboxChange}
                      id="defaultCheck1"
                    />
                    <label className="form-check-label text-[#8c9097] dark:text-white/50 font-normal text-xs" htmlFor="defaultCheck1">
                      Remember password?
                    </label>
                  </div>
                  {/* <Link to={`/forgotPassword`} className="ltr:float-right rtl:float-left text-danger text-xs text-[#8c9097] hover:text-primaryColor">Forget password?</Link> */}
                </div>
              </div>
              {error && <p className="col-span-12 mb-3 font-medium text-primaryColor">{error}</p>}

              <div className="grid col-span-12 mt-2 xl:col-span-12">
                <button
                  type="submit"
                  className="w-full py-2 text-xl font-bold border-[1.5px] backdrop-blur-md rounded-lg bg-primaryColor hover:bg-white/15 hover:text-primaryColor hover:border-primaryColor">
                  Login
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {loading && <LoaderScreen />}
    </>

  )
}

export default Login