import { SettingsPageShell } from '@/components/settings';

export default function NotificationsPage() {
  return (
    <SettingsPageShell
      title="Notifications"
      description="Manage your notification preferences"
    >
      <div className="py-12 text-center">
        <h3 className="mb-2 text-lg font-medium text-foreground">
          Notifications Settings
        </h3>
        <p className="text-muted-foreground">
          Notification preferences will be available here.
        </p>
      </div>
    </SettingsPageShell>
  );
}
