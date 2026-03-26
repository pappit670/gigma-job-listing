import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";

export function DemoLoadingBreadcrumb() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Animated Loading Breadcrumb</h2>
      <LoadingBreadcrumb text="Loading jobs..." />
    </div>
  );
}
