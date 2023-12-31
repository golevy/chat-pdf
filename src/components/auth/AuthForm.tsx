import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import AuthInput from "~/components/auth/AuthInput";
import { signIn } from "next-auth/react";
import { GithubIcon } from "~/components/Icons";
import toast from "react-hot-toast";
import { validateInputs } from "~/lib/utils";
import { api } from "~/trpc/react";

const AuthForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [variant, setVariant] = useState("login");

  const registerMutation = api.user.register.useMutation();

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) =>
      currentVariant === "login" ? "register" : "login",
    );
  }, []);

  const login = useCallback(async () => {
    if (!validateInputs({ email, password })) return;

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
      .then((res) => {
        if (res?.error) {
          if (res.error === "Email does not exist") {
            toast.error("Email does not exist, please try again");
          } else if (res.error === "Incorrect password") {
            toast.error("Incorrect password, please try again");
          } else {
            toast.error(res.error);
          }
        } else {
          toast.success("Login successfully");
          window.location.href = "/dashboard";
        }
      })
      .catch(() => {
        toast.error("Login failed");
      });
  }, [email, password]);

  const register = useCallback(async () => {
    if (!validateInputs({ email, name, password })) return;

    await registerMutation.mutateAsync(
      {
        email,
        name,
        password,
      },
      {
        onSuccess(res) {
          if (res.success) {
            toast.success("Account created successfully");
            setVariant("login");
          }
        },
        onError(err) {
          toast.error("Failed to create account");
          console.log(err);
        },
      },
    );
  }, [email, name, password, login]);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-6 text-3xl font-semibold">
          {variant === "login" ? "Sign in" : "Register"}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        {variant !== "login" && (
          <AuthInput
            label="Name"
            id="name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />
        )}
        <AuthInput
          label="Email"
          id="email"
          value={email}
          onChange={(e: any) => setEmail(e.target.value)}
          type="email"
        />
        <AuthInput
          label="Password"
          id="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          type="password"
        />
      </div>

      <DialogFooter>
        <Button
          onClick={variant === "login" ? login : register}
          className="mt-8 w-full py-6 text-base"
          type="submit"
        >
          {variant === "login" ? "Login" : "Sign up"}
        </Button>
      </DialogFooter>

      <div
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="mt-4 h-10 w-10 cursor-pointer self-center rounded-full transition hover:opacity-80"
      >
        <GithubIcon className="h-full w-full" />
      </div>

      <DialogDescription className="mt-4">
        {variant === "login"
          ? "First time using Molly?"
          : "Already have an account?"}
        <span
          onClick={toggleVariant}
          className="ml-1 cursor-pointer text-primary hover:underline"
        >
          {variant === "register" ? "Login" : "Create an account"}
        </span>
      </DialogDescription>
    </>
  );
};

export default AuthForm;
