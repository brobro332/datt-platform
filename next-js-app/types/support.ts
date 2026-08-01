export interface ServiceInquiry {
    id: number;
    category: string;
    content: string;
    answer?: string;
    status: string;
    authorId: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface Report {
    id: number;
    targetType: string;
    targetId: number;
    reason: string;
    status: string;
    reporterId: string;
    createdAt: string;
    resolvedAt?: string;
}

export interface InquiryCreateRequest {
    category: string;
    content: string;
}

export interface ReportCreateRequest {
    targetType: string;
    targetId: number;
    reason: string;
}
