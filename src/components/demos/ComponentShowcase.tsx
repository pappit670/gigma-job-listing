import { TeamInvitation } from "@/components/ui/team-invitation";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import OTPDialog from "@/components/ui/otpdialog";
import AuthDialog from "@/components/ui/auth-dialog";
import { ArrowLeft } from "lucide-react";

interface ComponentShowcaseProps {
  onBack: () => void;
}

export function ComponentShowcase({ onBack }: ComponentShowcaseProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-title">Component Showcase</h1>
        </div>
      </div>

      <div className="p-4 space-y-8 max-w-2xl mx-auto">
        {/* Section 1: Team Invitation */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">1. Team Invitation</h2>
          <p className="text-sm text-gray-500 mb-4">
            A notification card for team invitations with accept/decline actions.
          </p>
          <TeamInvitation />
        </section>

        {/* Section 2: Loading Breadcrumb */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">2. Animated Loading Breadcrumb</h2>
          <p className="text-sm text-gray-500 mb-4">
            SVG path animation with shimmer text effect for loading states.
          </p>
          <div className="p-4 bg-gray-50 rounded-xl">
            <LoadingBreadcrumb text="Finding nearby workers..." />
          </div>
        </section>

        {/* Section 3: OTP Dialog */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">3. OTP Verification Dialog</h2>
          <p className="text-sm text-gray-500 mb-4">
            4-digit code input with countdown timer and resend functionality.
          </p>
          <OTPDialog />
        </section>

        {/* Section 4: Auth Dialog */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">4. Auth Dialog (Sign Up / Login)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Toggle between signup and login modes with password visibility toggle.
          </p>
          <AuthDialog />
        </section>

        {/* Integration Notes */}
        <section className="bg-blue-50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2 text-blue-900">Integration Notes</h2>
          <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
            <li>All components are in <code>/components/ui/</code></li>
            <li>Dependencies: lucide-react, @radix-ui/react-icons</li>
            <li>Uses existing shadcn/ui Button, Dialog, Input, Label</li>
            <li>Dark mode support included</li>
            <li>Responsive and accessible</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
