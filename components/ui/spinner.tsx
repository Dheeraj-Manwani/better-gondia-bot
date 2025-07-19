import { cn } from "@/lib/utils";

export const Spinner = ({
  className,
  text,
  blur = false,
}: {
  className?: string;
  text?: string;
  blur?: boolean;
}) => {
  return (
    // <div
    //   className={cn(
    //     "h-[100dvh] w-[100dvw] flex items-center justify-center absolute inset-0",
    //     className
    //   )}
    // >
    //   <div className="text-center">
    //     <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
    //     {text && <p className="text-gray-500">{text}</p>}
    //   </div>
    // </div>
    <div
      className={cn(
        "h-[100dvh] w-[100dvw] flex items-center justify-center absolute inset-0 ",
        blur && " bg-black/30 backdrop-blur-sm ",
        className
      )}
    >
      <span className="loader absolute"></span>
    </div>
  );
};
