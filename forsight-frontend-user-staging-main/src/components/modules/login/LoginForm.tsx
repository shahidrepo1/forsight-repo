import { type FormEvent, useState } from "react";
import Input from "./Input";
import { PasswordToggle } from "./PasswordToggle";
import { LuUser } from "react-icons/lu";
import { RiLockPasswordFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../../../api/useLoginUser";
import axios from "axios";
import { useUser } from "../../../stores/useUser";
import { UserDetailSchema } from "../../../api/useLoginUser.types";
import { twMerge } from "tailwind-merge";

export function LoginForm() {
  const [formDetails, setFormDetails] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { mutate: loginUser, error, isPending, isError } = useLoginUser();
  const { setUser } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDetails({ ...formDetails, [e.target.name]: e.target.value });
  };

  const revealPassword = (checked: boolean) => {
    const input = document.getElementById("password");

    if (input && "type" in input) {
      input.type = checked ? "text" : "password";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if both email and password are empty
    if (!formDetails.email && !formDetails.password) {
      toast.error("Please enter credentials to continue");
      return;
    }

    // Check if email is empty
    if (!formDetails.email) {
      toast.error("Please enter Email to continue");
      return;
    }

    // Check if email format is invalid
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formDetails.email)) {
      toast.error("Invalid email format");
      return;
    }

    // Check if password is empty
    if (!formDetails.password) {
      toast.error("Please enter password to continue");
      return;
    }

    loginUser(formDetails, {
      onSuccess: (data) => {
        UserDetailSchema.parse(data);
        const refreshToken = data.refreshToken;
        // if (persistLogin) {
        localStorage.setItem("refreshToken", refreshToken);
        // }
        setUser(data);
        navigate("/");
      },
      onError: (error: Error) => {
        if (
          axios.isAxiosError<{
            message: string;
          }>(error)
        ) {
          toast.error(error.response?.data.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      },
    });
  };

  let errMessage = "none";

  if (isError && axios.isAxiosError<{ message: string }>(error)) {
    errMessage = error.response?.data.message ?? error.message;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-4xl font-bold text-center text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
        Forsight
      </div>
      <div className="mt-5 font-semibold text-center text-aquagreen-500">
        Login
      </div>
      <div className="mt-5 space-y-5">
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          value={formDetails.email}
          icon={<LuUser style={{ color: "#5d918f" }} />}
          onChange={handleInputChange}
          autoFocus={true}
          required
        />
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          value={formDetails.password}
          icon={<RiLockPasswordFill style={{ color: "#5d918f" }} />}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="flex justify-between mt-5">
        <div>
          <label
            htmlFor="persistLogin"
            className="flex items-center gap-1 text-sm text-black dark:text-dark-text dark:bg-dark-bg"
          >
            <input
              type="checkbox"
              name="persistLogin"
              id="persistLogin"
              className="appearance-none w-4 h-4 border border-gray-300 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
            />
            Remember me
          </label>
        </div>
        <PasswordToggle revealPassword={revealPassword} />
      </div>
      <div className="mt-5 text-center">
        <button
          disabled={isPending}
          className={`py-2  px-4 rounded-lg bg-[#337e7b] text-white font-semibold hover:bg-[#4cc0bc]  disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {/* {isPending ? "Logging In..." : "Login"} */}
          Login
        </button>
      </div>
      <p
        className={twMerge(
          "mt-3 text-sm text-red-500 invisible",
          isError && "visible"
        )}
      >
        {errMessage}
      </p>
    </form>
  );
}
