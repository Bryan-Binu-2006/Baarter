import React, { useState } from 'react';
import { User } from '../types/auth';

interface ProfileSetupProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

const steps = [
  'Basic Information',
  'Address Information',
  'Personal Bio',
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    bio: user.bio || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = () => {
    const errs: { [key: string]: string } = {};
    if (step === 0) {
      if (!form.fullName.trim()) errs.fullName = 'Full name is required';
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
    }
    if (step === 1) {
      if (!form.address.trim()) errs.address = 'Street address is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (!form.state.trim()) errs.state = 'State is required';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const updatedUser: User = {
        ...user,
        ...form,
        isProfileComplete: true,
      };
      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      // Optionally update allUsers
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const idx = allUsers.findIndex((u: User) => u.id === user.id);
      if (idx !== -1) {
        allUsers[idx] = updatedUser;
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
      }
      onComplete(updatedUser);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Complete Your Profile</h2>
        <div className="flex justify-center mb-6">
          {steps.map((label, i) => (
            <div key={label} className={`flex-1 h-2 mx-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code (optional)</label>
                <input
                  type="text"
                  name="zipCode"
                  value={form.zipCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Bio (optional)</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Tell your community about your interests, what you trade, etc. (max 500 chars)"
                />
                <p className="text-xs text-gray-500 mt-1">{form.bio.length}/500 characters</p>
              </div>
            </>
          )}
          <div className="flex justify-between">
            {step > 0 && (
              <button type="button" onClick={handleBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Back</button>
            )}
            {step < steps.length - 1 && (
              <button type="button" onClick={handleNext} className="ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Next</button>
            )}
            {step === steps.length - 1 && (
              <button type="submit" className="ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Finish</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup; 