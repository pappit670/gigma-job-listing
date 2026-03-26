import { ArrowLeft, Star, Briefcase, MapPin, Edit, LogOut, ChevronRight, Award, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { AVAILABLE_SKILLS } from '@/types';

interface ProfileViewProps {
  onClose: () => void;
}

export function ProfileView({ onClose }: ProfileViewProps) {
  const { state, dispatch, saveProfile } = useApp();
  const user = state.currentUser!;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleVerify = async () => {
    try {
      await saveProfile({ isVerified: true });
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const getSkillName = (id: string) => {
    return AVAILABLE_SKILLS.find(s => s.id === id)?.name || id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title">My Profile</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 text-center">
          <div className="relative inline-block">
            <img 
              src={user.photo || 'https://via.placeholder.com/96'} 
              alt="Profile" 
              className="profile-photo-lg mx-auto"
            />
            {user.isVerified && (
              <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white" title="Verified">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white">
              <Edit className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <h2 className="text-title mt-4">{user.nickname || user.realName}</h2>
          <p className="text-small text-gray-500">{user.location.address}</p>
          
          {user.roles.includes('worker') && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{user.rating > 0 ? user.rating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{user.totalJobs} jobs</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            {!user.isVerified && (
              <Button onClick={handleVerify} className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600">
                <Award className="w-4 h-4 mr-2" />
                Verify ID
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {new Date(user.joinedAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-caption text-gray-500">Joined</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {state.wallet?.balance.toLocaleString() || '0'}
            </p>
            <p className="text-caption text-gray-500">Balance (KES)</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {state.notifications.filter(n => !n.isRead).length}
            </p>
            <p className="text-caption text-gray-500">New Alerts</p>
          </div>
        </div>

        {/* Skills */}
        {user.roles.includes('worker') && user.skills.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-3">My Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {getSkillName(skill)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-small text-gray-600">{user.bio}</p>
          </div>
        )}

        {/* Verification */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold mb-3">Verification Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Phone Verified</p>
                  <p className="text-caption text-gray-500">{user.phone}</p>
                </div>
              </div>
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${user.isVerified ? 'bg-emerald-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                  <Award className={`w-5 h-5 ${user.isVerified ? 'text-emerald-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">Identity Verified</p>
                  <p className="text-caption text-gray-500">{user.isVerified ? 'Verified with ID' : 'Not verified yet'}</p>
                </div>
              </div>
              {user.isVerified && <Check className="w-5 h-5 text-emerald-500" />}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Location Set</p>
                  <p className="text-caption text-gray-500">{user.location.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl overflow-hidden">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
            <span className="font-medium">Account Settings</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <div className="h-px bg-gray-100 mx-4" />
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
            <span className="font-medium">Notifications</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <div className="h-px bg-gray-100 mx-4" />
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
            <span className="font-medium">Payment Methods</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <div className="h-px bg-gray-100 mx-4" />
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50">
            <span className="font-medium">Help & Support</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>

        {/* Footer */}
        <p className="text-center text-caption text-gray-400">
          Gigma v1.0 · Powered by TerraWork
        </p>
      </div>
    </div>
  );
}
