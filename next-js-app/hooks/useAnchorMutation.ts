import { useMutation } from "@tanstack/react-query";
import { createAnchor } from "@/services/anchorService";
import type { AnchorCreateRequest } from "@/types/anchor";

export function useCreateAnchor() {
    return useMutation({
        mutationFn: (request: AnchorCreateRequest) =>
            createAnchor(request),
    });
}