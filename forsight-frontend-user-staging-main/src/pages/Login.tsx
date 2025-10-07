import IconsContainer from "../components/modules/login/IconsContainer";
import { LoginForm } from "../components/modules/login/LoginForm";

export default function Login() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[40%_1fr] dark:text-dark-text dark:bg-dark-bg">
      <div className="flex items-center justify-center">
        <LoginForm />
      </div>
      <IconsContainer />
    </div>
  );
}
