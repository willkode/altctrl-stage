import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useCreatorBootstrap() {
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    setLoading(true);
    const user = await base44.auth.me();

    // Load or create CreatorProfile
    let profiles = await base44.entities.CreatorProfile.filter({ created_by: user.email });
    let p = profiles[0];
    if (!p) {
      p = await base44.entities.CreatorProfile.create({
        display_name: user.full_name || "Creator",
        onboarding_completed: false,
        beta_access: true,
        weekly_stream_target: 3,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
    }
    setProfile(p);

    // Load or create NotificationPrefs
    let prefsList = await base44.entities.NotificationPrefs.filter({ created_by: user.email });
    let np = prefsList[0];
    if (!np) {
      np = await base44.entities.NotificationPrefs.create({
        pre_stream_reminder: true,
        pre_stream_reminder_minutes: 30,
        promo_reminder: true,
        daily_coaching_card: true,
        weekly_plan_reminder: true,
        weekly_recap_notification: true,
        goal_alerts: true,
        performance_alerts: true,
        milestone_notifications: true,
        email_weekly_recap: false,
        email_performance_alerts: false,
        notification_email: user.email,
      });
    }
    setPrefs(np);
    setLoading(false);
  }

  async function completeOnboarding(updates) {
    const updated = await base44.entities.CreatorProfile.update(profile.id, {
      ...updates,
      onboarding_completed: true,
    });
    setProfile(updated);
  }

  return { profile, prefs, loading, error, completeOnboarding, setProfile };
}