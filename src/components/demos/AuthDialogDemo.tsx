import AuthDialog from "@/components/ui/auth-dialog";

export function DemoAuthDialog() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Auth Dialog (Sign Up / Login)</h2>
      <AuthDialog />
    </div>
  );
}
