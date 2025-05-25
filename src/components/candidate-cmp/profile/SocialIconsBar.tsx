"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Linkedin, XIcon, Globe, Edit, Twitter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { UserData } from "@/types/user";

interface SocialIconsBarProps {
  onUpdateUser: (data: Partial<UserData>) => Promise<void>;
  initialLinks?: {
    github?: string;
    linkedin?: string;
    x?: string;
    portfolio?: string;
  };
}

const SocialIconsBar: React.FC<SocialIconsBarProps> = ({ onUpdateUser, initialLinks }) => {
  const [socialLinks, setSocialLinks] = useState(initialLinks || {
    github: "",
    linkedin: "",
    x: "",
    portfolio: "",
  });
  const [tempLinks, setTempLinks] = useState({ ...socialLinks });
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize socialLinks with initialLinks when initialLinks changes
  useEffect(() => {
    setSocialLinks(initialLinks || {
      github: "",
      linkedin: "",
      x: "",
      portfolio: "",
    });
    setTempLinks(initialLinks || {
      github: "",
      linkedin: "",
      x: "",
      portfolio: "",
    });
  }, [initialLinks]);

  const handleInputChange = (platform: string, value: string) => {
    setTempLinks({ ...tempLinks, [platform]: value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const validLinks = Object.fromEntries(
        Object.entries(tempLinks).filter(([_, value]) => value.trim() !== "")
      );
      await onUpdateUser({ socialLinks: validLinks });
      setSocialLinks({ ...tempLinks });
    } catch (error) {
      console.error("Error saving social links:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const socialIcons = [
    {
      name: "github",
      icon: <Github className="w-5 h-5" />,
      label: "GitHub",
      placeholder: "Enter GitHub URL",
    },
    {
      name: "linkedin",
      icon: <Linkedin className="w-5 h-5" />,
      label: "LinkedIn",
      placeholder: "Enter LinkedIn URL",
    },
    {
      name: "x",
      icon: <Twitter className="w-5 h-5" />,
      label: "X",
      placeholder: "Enter X URL",
    },
    {
      name: "portfolio",
      icon: <Globe className="w-5 h-5" />,
      label: "Portfolio",
      placeholder: "Enter Portfolio URL",
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white shadow-md hover:bg-gray-50 border border-gray-100"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Social Media Links</DialogTitle>
            <DialogDescription>
              Connect your professional profiles
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {socialIcons.map((social) => (
              <div key={social.name} className="flex items-center gap-4">
                <div className="flex items-center gap-3 min-w-[100px]">
                  <div className="p-2 rounded-lg bg-gray-50">
                    {social.icon}
                  </div>
                  <span className="text-sm text-gray-700">{social.label}</span>
                </div>
                <Input
                  id={social.name}
                  value={tempLinks[social.name as keyof typeof tempLinks]}
                  onChange={(e) => handleInputChange(social.name, e.target.value)}
                  placeholder={social.placeholder}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" type="button" className="mr-2">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid grid-cols-4 gap-4">
        {socialIcons.map((social) => (
          <a
            key={social.name}
            href={socialLinks[social.name as keyof typeof socialLinks] || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-center transition-all duration-200 ${
              !socialLinks[social.name as keyof typeof socialLinks] &&
              "cursor-not-allowed opacity-50"
            }`}
            onClick={(e) =>
              !socialLinks[social.name as keyof typeof socialLinks] &&
              e.preventDefault()
            }
          >
            <div className="p-2 rounded-xl bg-neutral-200 border border-gray-100 group-hover:border-gray-200 group-hover:shadow-sm transition-all duration-200">
              {social.icon}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialIconsBar;