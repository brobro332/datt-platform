import { Button } from "@/components/common/Button";

import type { MemberTitleResponse } from "@/types/title";

type TitleCardProps = {
    title: MemberTitleResponse;
    isPending?: boolean;
    onSelect?: (titleId: number) => void;
};

export function TitleCard({
    title,
    isPending = false,
    onSelect,
}: TitleCardProps) {
    return (
        <article
            className={[
                "rounded-3xl border bg-white p-5 shadow-sm transition",
                title.selected
                    ? "border-gray-900"
                    : "border-gray-200 hover:border-gray-300",
            ].join(" ")}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-gray-500">
                        {title.code}
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-gray-950">
                        {title.name}
                    </h3>
                </div>

                {title.selected && (
                    <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                        대표
                    </span>
                )}
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-600">
                {title.description}
            </p>

            <p className="mt-4 text-xs text-gray-400">
                획득일{" "}
                {new Date(title.acquiredAt).toLocaleDateString()}
            </p>

            <div className="mt-5">
                <Button
                    type="button"
                    variant={title.selected ? "secondary" : "primary"}
                    disabled={title.selected || isPending}
                    onClick={() => onSelect?.(title.titleId)}
                >
                    {title.selected
                        ? "대표 칭호"
                        : isPending
                            ? "변경 중..."
                            : "대표로 설정"}
                </Button>
            </div>
        </article>
    );
}