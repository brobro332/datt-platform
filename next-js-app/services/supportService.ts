import { apiClient } from "@/lib/apiClient";
import { 
    ServiceInquiry, 
    Report, 
    InquiryCreateRequest, 
    ReportCreateRequest 
} from "../types/support";

export const supportService = {
    // User APIs
    createInquiry: async (request: InquiryCreateRequest): Promise<void> => {
        await apiClient.post("/api/support/inquiries", request);
    },

    createReport: async (request: ReportCreateRequest): Promise<void> => {
        await apiClient.post("/api/support/reports", request);
    },

    getMyInquiries: async (page = 0, size = 20): Promise<{ content: ServiceInquiry[]; totalPages: number }> => {
        const response = await apiClient.get(`/api/support/inquiries/me?page=${page}&size=${size}`);
        return response.data;
    },

    // Admin APIs
    getInquiries: async (page = 0, size = 20): Promise<{ content: ServiceInquiry[]; totalPages: number }> => {
        const response = await apiClient.get(`/api/admin/support/inquiries?page=${page}&size=${size}`);
        return response.data;
    },

    getReports: async (page = 0, size = 20): Promise<{ content: Report[]; totalPages: number }> => {
        const response = await apiClient.get(`/api/admin/support/reports?page=${page}&size=${size}`);
        return response.data;
    },

    resolveInquiry: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/admin/support/inquiries/${id}/resolve`);
    },

    resolveReport: async (id: number): Promise<void> => {
        await apiClient.patch(`/api/admin/support/reports/${id}/resolve`);
    }
};
