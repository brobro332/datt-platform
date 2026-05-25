import { useMutation, useQueryClient } from "@tanstack/react-query";

import { selectMyTitle } from "@/services/titleService";

export function useSelectMyTitle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (titleId: number) => selectMyTitle(titleId),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["my-titles"],
            });

            queryClient.invalidateQueries({
                queryKey: ["my-profile"],
            });
        },
    });
}