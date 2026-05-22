import { ToastProps } from "presentation/@types/toast";
import { AppError } from "./app_error";

type ErrorHandlerProps = {
  mainCb: () => Promise<void>;
  errorMessage: string;
  finallyCb?: () => Promise<void>;
  toast: ToastProps;
};

export const errorHandler = async ({
  mainCb,
  errorMessage,
  finallyCb,
  toast,
}: ErrorHandlerProps) => {
  try {
    await mainCb();
  } catch (e: any) {
    const isAppError = e instanceof AppError;
    const title = isAppError ? e.message : errorMessage;
    if ("token.invalid" !== e.message) {
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500",
        top: 10,
      });
    }
  } finally {
    finallyCb && finallyCb();
  }
};
