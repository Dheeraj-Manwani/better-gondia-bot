import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export const ComplaintScreenSkeleton = () => {
  return (
    <div className="max-w-md mx-auto  shadow-xl min-h-screen flex flex-col">
      <div className="bg-whatsapp-dark text-gray-700 p-3.5 flex items-center  sticky top-0 z-10 mb-2 justify-between pt-5 pb-0">
        <h1 className="font-semibold text-lg flex gap-1.5 justify-center align-middle">
          <Skeleton className="h-8 w-36" />
        </h1>
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
        {[1, 2, 3].map((i) => (
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-200 w-full max-w-md flex flex-col gap-2 mb-4">
            {/* <!-- Header --> */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <Skeleton className="w-24 h-3.5" />
              <Skeleton className="w-24 h-3.5" />
            </div>

            {/* <!-- Description --> */}
            <p className="text-gray-700 text-sm line-clamp-2">
              {/* Garbage is not being collected regularly in our colony near ABC Road.
             It&apos;s smelling bad. */}
              <Skeleton className="w-24 h-3.5" />
            </p>

            {/* <!-- Media thumbnails --> */}
            {/* <div className="flex gap-2 mt-1">
             <img
               src="/example1.jpg"
               alt="Complaint image"
               className="w-16 h-16 rounded object-cover border"
             />
             <video
               src="/example2.mp4"
               className="w-16 h-16 rounded object-cover border"
               muted
               loop
             ></video>
           </div> */}

            {/* <!-- Footer --> */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>
                <Skeleton className="w-24 h-3.5" />
              </span>
              <Skeleton className="w-24 h-3.5" />
            </div>

            {/* <!-- Status and Button --> */}
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="w-24 h-3.5" />

              <Skeleton className="w-24 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
