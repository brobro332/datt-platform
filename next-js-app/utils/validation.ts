export function isBlank(value: string) {
    return value.trim().length === 0;
}

export function isNumberValue(value: string) {
    return value.trim() !== "" && Number.isFinite(Number(value));
}

export function isInRange(
    value: number,
    min: number,
    max: number,
) {
    return value >= min && value <= max;
}