import { protectAuth } from "@/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ActivityTableSection from "./activity-history-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserService from "@/service/user.service";


async function fetchStatistics(token: string) {
  const userService = UserService();

  try {
    return await userService.getUserStatistics(token);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return {
      activeAppsConnections: 0,
      activeSubscriptions: { total_count: 0 },
      expenses: 0,
    };
  }
}

export default async function Page() {
  const userService = UserService();
  const session = await protectAuth();

  if (!session?.accessToken) return null;

  const [statistics, user] = await Promise.all([
    fetchStatistics(session.accessToken),
    userService.getUserProfile(session.accessToken),
  ]);

  if (!user) return null;

  return (
    <ScrollArea className="h-full">
      <div className="flex-1  p-4 md:p-8 pt-6">
        <UserWelcomeSection user={user} />
        <StatisticsSection statistics={statistics} />
        <Separator className="mt-8 mb-8" />
        <ActivityTableSection />
      </div>
    </ScrollArea>
  );
}

function UserWelcomeSection({ user }: { user: any }) {
  return (
    <div className="text-center space-y-2 mb-12">
      <AvatarContainer user={user} />
      <h1 className="text-2xl font-semibold">Welcome {user?.firstName ?? "To Eartho"}</h1>
      <p className="text-gray-500">
        Manage your info, privacy, and security to make Eartho work better for you.
      </p>
    </div>
  );
}

function AvatarContainer({ user }: { user: any }) {
  return (
    <div className="flex justify-center items-center">
      <Avatar className="h-32 w-32">
        <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
        <AvatarFallback>
          {(user.displayName || user.email)?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function StatisticsSection({ statistics }: { statistics: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatisticCard title="Active Apps" value={statistics?.activeAppsConnections || 0} />
      <StatisticCard title="Active Subscriptions" value={statistics?.activeSubscriptions?.total_count || 0} />
      <StatisticCard title="Expenses" value={`$${statistics?.expenses || 0}`} />
    </div>
  );
}

function StatisticCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <IconPlaceholder />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">0% from last month</p>
      </CardContent>
    </Card>
  );
}

function IconPlaceholder() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className="h-4 w-4 text-muted-foreground"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
