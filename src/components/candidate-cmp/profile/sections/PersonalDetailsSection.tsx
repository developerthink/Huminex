"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PersonalDetailsProps {
  email: string;
  state: string;
  skill: string[];
  summary?: string;
  tagline?: string;
  onUpdateUser: (data: { state: string; skill: string[]; summary?: string; tagline?: string }) => Promise<void>;
  isSaving: boolean;
}

const PersonalDetailsSection: React.FC<PersonalDetailsProps> = ({
  email,
  state: initialState,
  skill: initialDomains,
  summary: initialSummary = '',
  tagline: initialTagline = '',
  onUpdateUser,
  isSaving
}) => {
  const [skill, setDomains] = useState<string[]>(initialDomains);
  const [newDomain, setNewDomain] = useState('');
  const [state, setState] = useState(initialState);
  const [summary, setSummary] = useState(initialSummary);
  const [tagline, setTagline] = useState(initialTagline);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setState(initialState);
    setDomains(initialDomains);
    setSummary(initialSummary);
    setTagline(initialTagline);
    setHasChanges(false);
  }, [initialState, initialDomains, initialSummary, initialTagline]);

  const handleAddDomain = () => {
    if (newDomain.trim()) {
      const newDomains = [...skill, newDomain.trim()];
      setDomains(newDomains);
      setNewDomain('');
      setHasChanges(true);
    }
  };

  const handleRemoveDomain = (index: number) => {
    const newDomains = skill.filter((_, i) => i !== index);
    setDomains(newDomains);
    setHasChanges(true);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(e.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onUpdateUser({ state, skill, summary, tagline });
    setHasChanges(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      <div className="bg-white rounded-lg space-y-6">
      <div className="grid gap-2">
          <label htmlFor="tagline" className="text-sm font-medium">
            Tagline
          </label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => {
              setTagline(e.target.value);
              setHasChanges(true);
            }}
            placeholder="A brief professional headline"
            disabled={isSaving}
          />
        </div>

      <div className="grid gap-2">
          <label htmlFor="summary" className="text-sm font-medium">
            About
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Write a brief summary about yourself"
            disabled={isSaving}
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="state" className="text-sm font-medium">
            State*
          </label>
          <Input
            id="state"
            value={state}
            onChange={handleStateChange}
            placeholder="Enter your state"
            disabled={isSaving}
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="skill" className="text-sm font-medium">
            Skill*
          </label>
          <div className="flex gap-2">
            <Input
              id="skill"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="Add a skill"
              disabled={isSaving}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddDomain}
              variant="outline"
              disabled={isSaving}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {skill.map((domain, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{domain}</span>
                <button
                  onClick={() => handleRemoveDomain(index)}
                  disabled={isSaving}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

       
        

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;