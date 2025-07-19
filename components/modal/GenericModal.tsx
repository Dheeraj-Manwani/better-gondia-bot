import { Dialog } from "@/components/ui/dialog";

import { ModalType, useModal } from "@/store/modal";
import { Reload } from "./Reload";
import { FAQ } from "./FAQ";

export function GenericModal() {
  const { isOpen, setIsOpen, modalType } = useModal();
  const getModalFromType = (type: ModalType) => {
    switch (type) {
      case "Reload":
        return <Reload />;
      case "FAQ":
        return <FAQ />;
    }
  };
  const comp = getModalFromType(modalType ?? "Reload");
  return (
    <Dialog open={isOpen} modal onOpenChange={setIsOpen}>
      {comp}
    </Dialog>
  );
}

// import { Dialog, DialogContent } from "@radix-ui/react-dialog";
// import { useModal } from "@/store/modal";
// import { CrossIcon } from "lucide-react";

// export const GenericModal = () => {
//   const isOpen = useModal((state) => state.isOpen);
//   const setIsOpen = useModal((state) => state.setIsOpen);
//   return (
//     <Dialog open={isOpen}>
//       <DialogContent
//         className="bg-[#ffffff] text-gray-500 max-w-[95%] max-h-[90dvh] p-0 rounded-md mt-52"
//         onInteractOutside={(e) => {
//           e.preventDefault();
//           setIsOpen(false);
//         }}
//       >
//         <div
//           id="login-popup"
//           className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex"
//         >
//           <div className="relative p-4 w-full max-w-md">
//             <div className="relative bg-white rounded-lg shadow">
//               <button
//                 type="button"
//                 className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center popup-close"
//                 onClick={() => setIsOpen(false)}
//               >
//                 <CrossIcon className="w-5 h-5" />
//                 <span className="sr-only">Close popup</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };
