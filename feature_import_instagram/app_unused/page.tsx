import { Card } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentVideos } from "@/components/recent-videos"

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold">2,543</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Avg. Engagement Rate</p>
            <p className="text-2xl font-bold">4.28%</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Top Platform</p>
            <p className="text-2xl font-bold">TikTok</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Best Performing</p>
            <p className="text-2xl font-bold">Fashion</p>
          </div>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <div className="p-6">
            <div className="flex items-center justify-between space-y-2">
              <h3 className="text-lg font-medium">Engagement Overview</h3>
            </div>
            <Overview />
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="p-6">
            <div className="flex items-center justify-between space-y-2">
              <h3 className="text-lg font-medium">Recent Videos</h3>
            </div>
            <RecentVideos />
          </div>
        </Card>
      </div>
    </div>
  )
}