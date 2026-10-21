
import { ProfileForm } from "@/components/profile/ProfileForm"
import { ProfileSidebar } from "@/components/profile/ProfileSidebar"

export function ProfilePage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-24 pt-8 font-mono sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-8">
      <ProfileSidebar active="profile" />

      <main className="min-w-0">
        <ProfileForm />
      </main>
    </div>
  )
}
