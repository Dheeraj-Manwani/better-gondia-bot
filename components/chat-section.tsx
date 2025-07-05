"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { User, ChatMessage, Complaint, ComplaintFormData } from "@/types";
import {
  Paperclip,
  Smile,
  Send,
  MapPin,
  Camera,
  Check,
  CheckCheck,
  Mic,
  MicOff,
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.svg";
import singleColorLogo from "@/public/single-color-logo.svg";
import { useBot } from "@/store/messages";

interface ChatSectionProps {
  user: User;
}

export default function ChatSection({ user }: ChatSectionProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [botState, setBotState] = useState<BotState>({
  //   step: "idle",
  //   complaintData: {},
  // });
  const { botState, setBotState } = useBot();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chatMessages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  // const { sendChatMessage } = useWebSocket({
  //   userId: user.id,
  //   onMessage: (message) => {
  //     setMessages((prev) => [...prev, message]);
  //   },
  // });

  const createComplaintMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/complaints", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create complaint");
      return response.json();
    },
    onSuccess: (response) => {
      setBotState({ step: "idle", complaintData: {} });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/public"] });

      // Add success message to chat
      setTimeout(() => {
        addBotMessage(
          `✅ Complaint submitted successfully! Your complaint ID is ${response.complaintId}. We'll keep you updated on the progress.`,
          500
        );
      }, 1000);

      // toast({
      //   title: "Complaint Submitted",
      //   description: `Your complaint ${response.complaintId} has been registered successfully.`,
      // });
    },
    onError: (error) => {
      // toast({
      //   title: "Submission Failed",
      //   description: "Failed to submit complaint. Please try again.",
      //   variant: "destructive",
      // });
    },
  });

  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Add welcome message if no messages exist
    if (messages.length === 0 && !isLoading) {
      const welcomeMessage: ChatMessage = {
        id: 0,
        content:
          "Hi! I'm here to help you file complaints about civic issues in Gondia. Just describe the problem in your own words.",
        messageType: "bot",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, isLoading]);

  const addBotMessage = (content: string, delay = 1000) => {
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now(),
        content,
        messageType: "bot",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, delay);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });

        // Simulate voice-to-text conversion for demo
        const voiceText =
          "This is a detailed description of my complaint. The road has multiple potholes that make it dangerous for vehicles. It needs immediate attention from the municipal authorities.";

        const userMessage: ChatMessage = {
          id: Date.now(),
          userId: user.id,
          content: voiceText,
          messageType: "user",
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        setBotState({
          ...botState,
          step: "location",
          complaintData: { ...botState.complaintData, description: voiceText },
        });

        setTimeout(() => {
          addBotMessage(
            "Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step."
          );
        }, 500);
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();

      // toast({
      //   title: "Recording Started",
      //   description: "Speak clearly to describe your complaint in detail.",
      // });
    } catch (error) {
      // toast({
      //   title: "Microphone Access Required",
      //   description: "Please allow microphone access to record voice messages.",
      //   variant: "destructive",
      // });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);

      // toast({
      //   title: "Recording Stopped",
      //   description: "Processing your voice message...",
      // });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: user.id,
      content: messageInput,
      messageType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Handle bot responses based on current state
    if (botState.step === "idle") {
      // User is describing a complaint
      setBotState({
        step: "category",
        complaintData: {
          title: messageInput,
          description: messageInput,
        },
      });

      addBotMessage(
        // "Thanks for reporting! Please select the category for your complaint:"
        "Please select the category for your complaint:"
      );
    } else if (botState.step === "description") {
      // User provided detailed description
      setBotState({
        step: "location",
        complaintData: { ...botState.complaintData, description: messageInput },
      });

      addBotMessage(
        "Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step."
      );
    } else if (botState.step === "location") {
      // User provided location manually
      setBotState({
        step: "media",
        complaintData: { ...botState.complaintData, location: messageInput },
      });

      addBotMessage(
        "Great! Would you like to add a photo or video to help illustrate the issue? You can also skip this step."
      );
    }

    setMessageInput("");
  };

  const handleDescriptionInput = (description: string) => {
    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: user.id,
      content: description,
      messageType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setBotState({
      step: "location",
      complaintData: { ...botState.complaintData, description },
    });

    addBotMessage(
      "Thank you for the detailed description! Now, can you provide the location? You can share your current location, type the address manually, or skip this step."
    );
  };

  const handleCategorySelect = (category: string) => {
    const categoryMap: Record<string, string> = {
      roads: "🛣️ Roads & Traffic",
      water: "💧 Water Supply",
      electricity: "⚡ Electricity",
      sanitation: "🗑️ Sanitation",
    };

    const userMessage: ChatMessage = {
      id: Date.now(),
      userId: user.id,
      content: categoryMap[category],
      messageType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setBotState({
      step: "description",
      complaintData: { ...botState.complaintData, category },
    });

    addBotMessage(
      "Perfect! Now please describe your complaint in detail. Explain what exactly is the problem, when you noticed it, and how it's affecting you or your community."
    );
  };

  const handleLocationAction = (action: string) => {
    if (action === "current") {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBotState({
            step: "media",
            complaintData: {
              ...botState.complaintData,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
              location: "Current Location",
            },
          });
          addBotMessage(
            "Location captured! Would you like to add a photo or video?"
          );
        },
        () => {
          // toast({
          //   title: "Location Error",
          //   description:
          //     "Unable to get your location. Please type it manually.",
          //   variant: "destructive",
          // });
        }
      );
    } else if (action === "manual") {
      addBotMessage("Please type the address or location of the issue:");
    } else if (action === "skip") {
      setBotState({ ...botState, step: "media" });
      addBotMessage(
        "Location skipped. Would you like to add a photo or video?"
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setBotState({
          step: "preview",
          complaintData: { ...botState.complaintData, imageUrl: data.url },
        });
        addBotMessage("Photo uploaded! Here's a preview of your complaint:");
        showComplaintPreview();
      })
      .catch((error) => {
        // toast({
        //   title: "Upload Failed",
        //   description: "Failed to upload file. Please try again.",
        //   variant: "destructive",
        // });
      });
  };

  const showComplaintPreview = () => {
    const preview = `
**Complaint Preview:**
- Issue: ${botState.complaintData.title}
- Category: ${botState.complaintData.category}
- Location: ${botState.complaintData.location || "Not specified"}
- Your Details: ${user.name} • +91 ${user.mobile}

Would you like to submit this complaint?
    `;

    setTimeout(() => {
      addBotMessage(preview);
    }, 500);
  };

  const handleComplaintSubmit = () => {
    // Ensure we have the required data
    if (!botState.complaintData.title || !botState.complaintData.category) {
      // toast({
      //   title: "Missing Information",
      //   description: "Please complete all required fields before submitting.",
      //   variant: "destructive",
      // });
      return;
    }

    const formData = new FormData();
    formData.append("title", botState.complaintData.title);
    formData.append(
      "description",
      botState.complaintData.description || botState.complaintData.title
    );
    formData.append("category", botState.complaintData.category);
    formData.append("isPublic", "true");

    if (botState.complaintData.location) {
      formData.append("location", botState.complaintData.location);
    }
    if (botState.complaintData.latitude) {
      formData.append("latitude", botState.complaintData.latitude);
    }
    if (botState.complaintData.longitude) {
      formData.append("longitude", botState.complaintData.longitude);
    }

    createComplaintMutation.mutate(formData);
  };

  const renderBotMessage = (message: ChatMessage) => {
    if (
      botState.step === "category" &&
      message.content.includes("select the category")
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm">
          <p className="text-sm whatsapp-dark mb-3">{message.content}</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={() => handleCategorySelect("roads")}
            >
              🛣️ Roads
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => handleCategorySelect("water")}
            >
              💧 Water
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              onClick={() => handleCategorySelect("electricity")}
            >
              ⚡ Electric
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              onClick={() => handleCategorySelect("sanitation")}
            >
              🗑️ Sanitation
            </Button>
          </div>
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Bot
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (
      botState.step === "location" &&
      message.content.includes("provide the location")
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm">
          <p className="text-sm whatsapp-dark mb-3">{message.content}</p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center"
              onClick={() => handleLocationAction("current")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Share Current Location
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              onClick={() => handleLocationAction("manual")}
            >
              Type Address Manually
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => handleLocationAction("skip")}
            >
              Skip (Optional)
            </Button>
          </div>
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Bot
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (
      botState.step === "media" &&
      message.content.includes("photo or video")
    ) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm">
          <p className="text-sm whatsapp-dark mb-3">{message.content}</p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photo/Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => showComplaintPreview()}
            >
              Skip & Preview
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Bot
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    if (message.content.includes("Complaint Preview")) {
      return (
        <div className="chat-bubble-received p-3 max-w-sm shadow-sm">
          <div className="text-sm whatsapp-dark whitespace-pre-line mb-3">
            {message.content}
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-gray-100 text-gray-700"
              onClick={() => {
                setBotState({
                  step: "category",
                  complaintData: { title: botState.complaintData.title },
                });
                addBotMessage(
                  "Let's edit your complaint. Please select the category again:"
                );
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              className="flex-1 whatsapp-green text-white"
              onClick={handleComplaintSubmit}
              disabled={createComplaintMutation.isPending}
            >
              {createComplaintMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
          <div className="flex items-center text-xs whatsapp-gray mt-2">
            <span className="flex items-center gap-1">
              Better Gondia Bot
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </span>
            <span className="mx-1">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="chat-bubble-received p-3 max-w-xs shadow-sm border border-gray-200">
        <p className="text-sm whatsapp-dark whitespace-pre-line">
          {message.content}
        </p>
        <div className="flex items-center text-xs whatsapp-gray mt-2">
          <span className="flex items-center gap-1">
            Better Gondia Bot
            <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-2 h-2 text-white" />
            </div>
          </span>
          <span className="mx-1">•</span>
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {/* <div className="flex justify-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-400 px-4 py-2 rounded-r-lg max-w-10/12">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-yellow-800">
                Better Gondia Mitra
              </span>
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-2 h-2 text-white" />
              </div>
            </div>
            <p className="text-sm text-yellow-800">
              Welcome! Type your complaint or issue to get started.
            </p>
          </div>
        </div> */}

        {messages.map((message, index) => (
          <div key={`${message.id}-${index}`}>
            {message.messageType === "bot" ? (
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-green-300/50  rounded-full flex items-center justify-center flex-shrink-0 m-2">
                  <Image
                    src={logo}
                    height={50}
                    width={50}
                    alt="logo"
                    className="p-0.5"
                  />
                </div>
                {renderBotMessage(message)}
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="chat-bubble-sent p-3 max-w-xs shadow-sm ">
                  <p className="text-sm whatsapp-dark">{message.content}</p>
                  <div className="flex items-center justify-end text-xs whatsapp-gray mt-2 gap-1">
                    <span>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        {botState.step === "description" ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 whatsapp-gray hover:text-green-600"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1 chat-input-container flex items-center">
                <Input
                  placeholder="Describe your complaint in detail..."
                  className="flex-1 bg-transparent outline-none border-none text-sm"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 whatsapp-gray hover:text-green-600"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              <Button
                className="w-10 h-10 whatsapp-green rounded-full flex items-center justify-center text-white hover:bg-green-600 shadow-lg"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Voice Message Option */}
            <div className="flex items-center justify-center">
              <div className="text-xs whatsapp-gray mr-3">or</div>
              <Button
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                }`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span className="text-sm">Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span className="text-sm">Voice Message</span>
                  </>
                )}
              </Button>
            </div>

            {isRecording && (
              <div className="text-center">
                <div className="text-xs text-red-500 animate-pulse">
                  Recording... Speak clearly about your complaint
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 whatsapp-gray hover:text-green-600"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 chat-input-container flex items-center">
              <Input
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none border-none text-sm"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                variant="ghost"
                size="sm"
                className="p-1 whatsapp-gray hover:text-green-600"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Button
              className="w-10 h-10 whatsapp-green rounded-full flex items-center justify-center text-white hover:bg-green-600 shadow-lg"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
