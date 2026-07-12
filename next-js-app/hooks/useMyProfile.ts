import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/services/memberService";

export function useMyProfile() {
    return useQuery({
        queryKey: ["my-profile"],
        queryFn: getMyProfile,
    });
}