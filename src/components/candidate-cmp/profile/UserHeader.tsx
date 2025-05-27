"use client";
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { File, Edit, CircleUserRoundIcon, XIcon, Edit2 } from "lucide-react";
import Link from "next/link";
import { UserData } from "@/types/user";
import { uploadToCloudinary } from "@/lib/image-upload";
import { toast } from "sonner";
import WbLoader from "@/components/global-cmp/wbLoader";

interface UserHeaderProps {
  user: UserData;
  onUpdateUser?: (data: Partial<UserData>) => Promise<void>;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, onUpdateUser }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadToCloudinary(file);
      const newImageUrl = result.secure_url;
      setAvatarUrl(newImageUrl);
      
      if (onUpdateUser) {
        await onUpdateUser({ image: newImageUrl });
        toast.success('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      if (onUpdateUser) {
        await onUpdateUser({ image: undefined });
        setAvatarUrl(null);
        toast.success('Profile image removed successfully');
      }
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast.error('Failed to remove image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const previewUrl = avatarUrl || user.image || null;

  return (
    <div className="flex items-center justify-between bgGrad text-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-6">
        {/* User Avatar */}
        <div className="relative inline-flex">
          <button
            className="border-input hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
            onClick={handleButtonClick}
            disabled={isUploading}
            aria-label={previewUrl ? "Change image" : "Upload image"}
          >
            {isUploading ? (
              <div className="animate-pulse *:!h-auto"><WbLoader/></div>
            ) : previewUrl ? (
              <img
                className="size-full bg-slate-50 object-cover"
                src={previewUrl}
                alt="User avatar"
                width={80}
                height={80}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div aria-hidden="true">
                <CircleUserRoundIcon className="size-10 opacity-60" />
              </div>
            )}
          </button>
          {previewUrl && (
            <Button
              // onClick={handleRemoveImage}
              disabled={isUploading}
              size="icon"
              className="border-background focus-visible:border-background absolute -top-1 -right-1 size-6 rounded-full border-2 shadow-none"
              aria-label="Remove image"
            >
              <Edit2 className="size-3.5" />
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload image file"
          />
        </div>
        {/* User Details */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-sm text-white leading-relaxed">
            {user.role} • {user.state}
          </p>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-3">
        
        <Link href={'/candidates/' + user._id} target="_blank">
        <Button variant="ghost" className="bg-white" aria-label="View your resume">
          <File className="w-4 h-4 mr-2" />
          View Profile
        </Button>
        </Link>
      </div>
    </div>
  );
};

export default UserHeader;