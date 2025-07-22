import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Cross, X } from "lucide-react";
import { ProfileFormData, User } from "@/types";
import { toast } from "sonner";
import { useUserData } from "@/store/userData";
import { useAuthStep } from "@/store/authStep";
import { setCookie } from "cookies-next";
import { useSections } from "@/store/section";
import { useLoaderStore } from "@/store/loader";

interface ProfileScreenProps {
  mobile: string;
  onNext: () => void;
  onBack: () => void;
}

export default function ProfileScreen({
  mobile,
  onNext,
  onBack,
}: ProfileScreenProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    // firstName: "",
    // lastName: "",
    name: "",
    mobile,
    address: "",
    age: 0,
    gender: "",
  });
  const setUserData = useUserData((state) => state.setUserData);
  const setAuthStep = useAuthStep((state) => state.setAuthStep);
  const setSection = useSections((state) => state.setSection);
  const showLoader = useLoaderStore((state) => state.showLoader);

  // const { toast } = useToast();
  // const queryClient = useQueryClient();

  const completeProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/complete-profile",
        data
      );
      console.log("Profile creation response:", response);
      return response.json();
    },
    onSuccess: (res) => {
      // toast.success("Profile creation successfull!", {
      //   description: "Welcome to Better Gondia Mitra!",
      //   // action: {
      //   //   label: <X className="bg-transparent fill-white text-white" />,
      //   //   onClick: (id) => {
      //   //     toast.dismiss();
      //   //   },
      //   //   actionButtonStyle: {
      //   //     backgroundColor: "transparent",
      //   //     color: "transparent",
      //   //   },
      //   // },
      // });
      setSection("chat");
      console.log("Data recieved on success:", res);
      const savedUser = res.data;
      const newUser = { ...savedUser } as User;
      localStorage.setItem("userData", JSON.stringify(newUser));
      setUserData(newUser);
      setCookie("userId", newUser.id);

      setAuthStep("complete");
      localStorage.setItem("authStep", "complete");

      // queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onNext();
    },
    onError: (error: Error) => {
      // toast({
      //   title: "Profile Creation Failed",
      //   description: error.message,
      //   variant: "destructive",
      // });
      const err = error.message.split('"');
      const message = err[err.length - 2];
      toast.error(message);
      console.log("Profile creation error:", message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.mobile ||
      !formData.address ||
      !formData.age ||
      !formData.gender
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Name validation: more than 5 characters
    if (formData.name.trim().length <= 5) {
      toast.error("Name must be more than 5 characters");
      return;
    }

    // Age validation: between 16 and 110
    const ageNum = Number(formData.age);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 110) {
      toast.error("Age must be between 16 and 110");
      return;
    }

    // Mobile validation: 10 digits, only numbers
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // Address validation: more than 10 characters
    if (formData.address.trim().length <= 10) {
      toast.error("Address must be more than 10 characters");
      return;
    }

    completeProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#075E54] text-white p-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4 text-white hover:bg-white hover:bg-opacity-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Complete Profile</h1>
        </div>

        {/* Profile Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm font-medium  mb-2">Name *</Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2 w-full justify-between">
              <div className="w-full">
                <Label className="block text-sm font-medium  mb-2">Age *</Label>
                <Input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  required
                />
              </div>

              <div className="w-full">
                <Label className="block text-sm font-medium  mb-2">
                  Gender *
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="w-full border border-gray-300 rounded-lg px-3 py-3 ">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-2xl">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-medium  mb-2">
                Phone Number *
              </Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:border-none "
                placeholder="Enter your phone number"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                required
              />
            </div>

            {/* <div>
              <Label className="block text-sm font-medium  mb-2">
                Last Name *
              </Label>
              <Input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 "
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div> */}

            <div>
              <Label className="block text-sm font-medium  mb-2">
                Address *
              </Label>
              <Textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-3  h-20 resize-none"
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>
          </form>
        </div>

        {/* Bottom Button */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#075E54] text-white py-3 rounded-lg font-medium hover:bg-[#075E54] transition-colors"
            disabled={completeProfileMutation.isPending}
          >
            {completeProfileMutation.isPending
              ? "Creating Profile..."
              : "Complete Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
}
