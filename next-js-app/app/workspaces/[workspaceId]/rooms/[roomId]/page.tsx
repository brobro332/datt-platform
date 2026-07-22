import { redirect } from "next/navigation";

export default function WorkspaceRoomRedirectPage({ params }: { params: { workspaceId: string } }) {
    redirect(`/workspaces/${params.workspaceId}`);
}
