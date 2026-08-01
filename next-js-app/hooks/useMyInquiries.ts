import { useQuery } from "@tanstack/react-query";
import { supportService } from "@/services/supportService";

export function useMyInquiries(page = 0, size = 20) {
    return useQuery({
        queryKey: ["myInquiries", page, size],
        queryFn: () => supportService.getMyInquiries(page, size),
    });
}
