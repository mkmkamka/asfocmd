import Link from "next/link";
import LogoutButton from "./LogoutButton";

/* Every admin page above the dashboard carries the same head: a way back, the
   title, and whatever single action the page is for. The way back is a real
   link rather than browser history, because arriving from a redirect after
   saving is the common case and history would send the owner to the form he
   just submitted. */
export default function AdminHeader({
  title,
  lead,
  back = "/admin",
  backLabel = "Panou",
  action,
}: {
  title: string;
  lead?: string;
  back?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="admin-head">
      <div>
        <Link className="admin-back" href={back}>
          ← {backLabel}
        </Link>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
      <div className="admin-head-actions">
        {action}
        <LogoutButton />
      </div>
    </header>
  );
}
