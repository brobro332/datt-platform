"use client";

import { useState } from "react";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { MainLayout } from "@/layouts/MainLayout";

import { Button } from "@/components/common/Button";
import { FormErrorMessage } from "@/components/common/FormErrorMessage";
import { FormSection } from "@/components/common/FormSection";
import { Input } from "@/components/common/Input";

import { useCreateAnchor } from "@/hooks/useAnchorMutation";

import {
    isBlank,
    isNumberValue,
} from "@/utils/validation";

export default function AnchorCreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialBasePlaceId =
        searchParams.get("basePlaceId");

    const initialBasePlaceName =
        searchParams.get("basePlaceName") ?? "";

    const initialBaseAddress =
        searchParams.get("baseAddress") ?? "";

    const initialBaseLon =
        searchParams.get("baseLon") ?? "";

    const initialBaseLat =
        searchParams.get("baseLat") ?? "";

    const [title, setTitle] = useState("");

    const [basePlaceName, setBasePlaceName] =
        useState(initialBasePlaceName);

    const [baseAddress, setBaseAddress] =
        useState(initialBaseAddress);

    const [baseLon, setBaseLon] =
        useState(initialBaseLon);

    const [baseLat, setBaseLat] =
        useState(initialBaseLat);

    const [radiusKm, setRadiusKm] =
        useState("1");

    const [isPublic, setIsPublic] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

    const createAnchorMutation =
        useCreateAnchor();

    async function handleSubmit(
        event: { preventDefault: () => void },
    ) {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (isBlank(trimmedTitle)) {
            setErrorMessage("Anchor 제목을 입력해주세요.");
            return;
        }

        if (trimmedTitle.length > 100) {
            setErrorMessage("Anchor 제목은 100자 이하로 입력해주세요.");
            return;
        }

        if (baseLon && !isNumberValue(baseLon)) {
            setErrorMessage("경도는 숫자로 입력해주세요.");
            return;
        }

        if (baseLat && !isNumberValue(baseLat)) {
            setErrorMessage("위도는 숫자로 입력해주세요.");
            return;
        }

        if (radiusKm && !isNumberValue(radiusKm)) {
            setErrorMessage("탐색 반경은 숫자로 입력해주세요.");
            return;
        }

        if (radiusKm && Number(radiusKm) <= 0) {
            setErrorMessage("탐색 반경은 0보다 커야 합니다.");
            return;
        }

        try {
            setErrorMessage("");

            const response =
                await createAnchorMutation.mutateAsync({
                    title: trimmedTitle,

                    basePlaceId: initialBasePlaceId
                        ? Number(initialBasePlaceId)
                        : null,

                    basePlaceName:
                        basePlaceName.trim() || null,

                    baseAddress:
                        baseAddress.trim() || null,

                    baseLon: baseLon
                        ? Number(baseLon)
                        : null,

                    baseLat: baseLat
                        ? Number(baseLat)
                        : null,

                    radiusKm: radiusKm
                        ? Number(radiusKm)
                        : null,

                    isPublic,
                });

            alert("Anchor 생성 완료! 경험치 +30 획득");

            router.push(`/anchors/${response.anchorId}`);
        } catch (error) {
            console.error(error);

            setErrorMessage(
                "Anchor 생성에 실패했습니다.",
            );
        }
    }

    return (
        <MainLayout>
            <section className="mx-auto max-w-2xl space-y-6">
                <div>
                    <p className="text-sm font-semibold text-gray-500">
                        Create Anchor
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                        Anchor 생성
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        기준 장소를 중심으로 주변 경험을 묶는
                        Anchor를 생성합니다.
                    </p>
                </div>

                <FormSection
                    title="Anchor 기본 정보"
                    description="Anchor 제목과 기준 장소 정보를 입력해주세요."
                >
                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit}
                    >
                        <Input
                            id="title"
                            label="Anchor 제목"
                            placeholder="예: 의정부역 반나절 데이트 코스"
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value,
                                )
                            }
                        />

                        <Input
                            id="basePlaceName"
                            label="기준 장소명"
                            placeholder="예: 의정부역"
                            value={basePlaceName}
                            onChange={(event) =>
                                setBasePlaceName(
                                    event.target.value,
                                )
                            }
                        />

                        <Input
                            id="baseAddress"
                            label="기준 주소"
                            placeholder="예: 경기도 의정부시"
                            value={baseAddress}
                            onChange={(event) =>
                                setBaseAddress(
                                    event.target.value,
                                )
                            }
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                id="baseLon"
                                label="경도"
                                type="number"
                                step="any"
                                placeholder="127.0000"
                                value={baseLon}
                                onChange={(event) =>
                                    setBaseLon(
                                        event.target.value,
                                    )
                                }
                            />

                            <Input
                                id="baseLat"
                                label="위도"
                                type="number"
                                step="any"
                                placeholder="37.0000"
                                value={baseLat}
                                onChange={(event) =>
                                    setBaseLat(
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <Input
                            id="radiusKm"
                            label="탐색 반경 km"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={radiusKm}
                            onChange={(event) =>
                                setRadiusKm(
                                    event.target.value,
                                )
                            }
                        />

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(event) =>
                                    setIsPublic(
                                        event.target.checked,
                                    )
                                }
                            />

                            공개 Anchor로 등록
                        </label>

                        <FormErrorMessage
                            message={errorMessage}
                        />

                        <Button
                            type="submit"
                            disabled={
                                createAnchorMutation.isPending
                            }
                        >
                            {createAnchorMutation.isPending
                                ? "생성 중..."
                                : "Anchor 생성"}
                        </Button>
                    </form>
                </FormSection>
            </section>
        </MainLayout>
    );
}