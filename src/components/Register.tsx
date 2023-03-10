import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Navbar from "./Navbar";
import * as yup from "yup";
import axios from 'axios';

type Inputs = {
  email: string;
  password: string;
};
const schema = yup
  .object({
    email: yup.string().email().required("Please enter username!"),
    password: yup.string().required("Please enter password!"),
  })
  .required();

const Register: FC<{ isLoginPage: boolean }> = ({ isLoginPage }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Inputs> = async(data) => {
    if(!isLoginPage){
      const response = await axios.post(`${process.env.REACT_APP_SECRET_NAME}/v1/auth/register`, data)
      if(response.status === 201){
        localStorage.setItem('token',response.data.token.accessToken)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token.accessToken;
        axios.defaults.headers.common['Content-Type'] = 'application/json'
        navigate('/recipes')
      }
    }else{
      const response = await axios.post(`${process.env.REACT_APP_SECRET_NAME}/v1/auth/login`, data)
      if(response.status === 200){
        localStorage.setItem('token',response.data.token.accessToken)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token.accessToken;
        axios.defaults.headers.common['Content-Type'] = 'application/json'
        navigate('/recipes')
      }
    }
      
  };
  const onToggleHandler = (): void => {
    isLoginPage ? navigate("/register") : navigate("/login");
  };

  return (
    <>
    <Navbar/>
    <div className="d-flex text-center">
      <main className="form-signin">
        <form onSubmit={handleSubmit(onSubmit)}>
          <img
            className="mb-4"
            src="https://getbootstrap.com/docs/5.0/assets/brand/bootstrap-logo.svg"
            alt=""
            width="72"
            height="57"
          />
          <h1 className="h3 mb-3 fw-normal">
            Please {isLoginPage ? "log in" : "sign in"}
          </h1>

          <div className="form-floating">
            <input
              type="email"
              className="form-control"
              id="floatingInput"
              {...register("email")}
              placeholder="name@example.com"
            />
            <label htmlFor="floatingInput">Email address</label>
          </div>
          <p className="text-danger">{errors.email?.message}</p>

          <div className="form-floating">
            <input
              type="password"
              className="form-control my-2"
              {...register("password")}
              id="floatingPassword"
              placeholder="Password"
            />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <p className="text-danger">{errors.password?.message}</p>

          <button className="w-100 btn btn-lg btn-primary" type="submit">
            {isLoginPage ? "Log In" : "Sign in"}
          </button>
        </form>
        <p
          className="text-success my-2"
          role="button"
          onClick={onToggleHandler}
        >
          {!isLoginPage
            ? "Already having an account? LogIn"
            : "Create Account? Sign In"}
        </p>
      </main>
    </div>
    </>
  );
};

export default Register;
