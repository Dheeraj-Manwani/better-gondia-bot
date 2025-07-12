import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatusUpdate } from "@/types";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function StatusSection() {
  const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: statusUpdates, isLoading } = useQuery<StatusUpdate[]>({
    queryKey: ["/api/status/updates"],
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const openStatus = (status: StatusUpdate, index: number) => {
    setSelectedStatus(status);
    setCurrentIndex(index);
  };

  const closeStatus = () => {
    setSelectedStatus(null);
  };

  const nextStatus = () => {
    if (statusUpdates && currentIndex < statusUpdates.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedStatus(statusUpdates[nextIndex]);
    }
  };

  const prevStatus = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedStatus(statusUpdates![prevIndex]);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500">Loading status updates...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Status Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <h2 className="font-semibold ">Civic Updates</h2>
          <p className="text-sm whatsapp-gray">
            Photos & videos of resolved complaints
          </p>
        </div>

        {/* Status Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Status Stories */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* My Status */}
            <div className="flex flex-col items-center">
              <div className="status-ring-viewed w-16 h-16 mb-2">
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-500" />
                </div>
              </div>
              <p className="text-xs  text-center">My Status</p>
            </div>

            {/* Admin Status Updates */}
            {statusUpdates?.slice(0, 3).map((status, index) => (
              <div
                key={status.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => openStatus(status, index)}
              >
                <div className="status-ring w-16 h-16 mb-2">
                  <img
                    src={status.imageUrl || "/placeholder-image.jpg"}
                    alt={status.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <p className="text-xs  text-center">
                  {status.title.slice(0, 10)}...
                </p>
              </div>
            ))}
          </div>

          {/* Recent Updates */}
          <div className="space-y-4">
            <h3 className="font-medium ">Recent Updates</h3>

            {statusUpdates?.map((update) => (
              <div
                key={update.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 whatsapp-green rounded-full flex items-center justify-center">
                      <i className="fas fa-shield-alt text-white text-xs"></i>
                    </div>
                    <div>
                      <p className="font-medium text-sm ">
                        Gondia Municipal Corp
                      </p>
                      <p className="text-xs whatsapp-gray">
                        {formatTimeAgo(update.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {update.imageUrl && (
                  <img
                    src={update.imageUrl}
                    alt={update.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                <p className="text-sm  mb-2">
                  <strong>{update.title}</strong>
                </p>
                {update.description && (
                  <p className="text-sm whatsapp-gray">{update.description}</p>
                )}
              </div>
            ))}

            {(!statusUpdates || statusUpdates.length === 0) && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-image text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">
                  No Status Updates
                </h3>
                <p className="text-gray-500 text-sm">
                  Check back later for civic updates and resolved complaints!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Viewer Modal */}
      {selectedStatus && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="flex flex-col h-full">
            {/* Status Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeStatus}
                className="p-2 text-white hover:bg-white hover:bg-opacity-10"
              >
                <X className="w-6 h-6" />
              </Button>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-gray-600 rounded-full">
                  <div className="h-1 bg-white rounded-full status-progress"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStatus}
                  disabled={currentIndex === 0}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextStatus}
                  disabled={
                    !statusUpdates || currentIndex === statusUpdates.length - 1
                  }
                  className="p-2 text-white hover:bg-white hover:bg-opacity-10 disabled:opacity-50"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Status Content */}
            <div className="flex-1 flex items-center justify-center">
              {selectedStatus.imageUrl ? (
                <img
                  src={selectedStatus.imageUrl}
                  alt={selectedStatus.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-white text-center">
                  <p className="text-lg">{selectedStatus.title}</p>
                  {selectedStatus.description && (
                    <p className="text-sm opacity-75 mt-2">
                      {selectedStatus.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div className="p-4 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 whatsapp-green rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-xs"></i>
                </div>
                <div>
                  <p className="font-medium text-sm">Gondia Municipal Corp</p>
                  <p className="text-xs opacity-75">
                    {formatTimeAgo(selectedStatus.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm">
                {selectedStatus.description || selectedStatus.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
