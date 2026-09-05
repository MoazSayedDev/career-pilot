import { redirect } from "next/navigation";

/**
 * The dashboard sidebar points at /profile/contact-info for the personal
 * info form; /profile itself has no distinct screen, so send people
 * straight there instead of rendering an empty page.
 */
export default function ProfilePage() {
  redirect("/profile/contact-info");
}
