import { api } from "./api";
import { 
    ServiceInquiry, 
    Report, 
    InquiryCreateRequest, 
    ReportCreateRequest 
} from "../types/support";

export const supportService = {
    // User APIs
    createInquiry: async (request: InquiryCreateRequest): Promise<void> => {
        await api.post("/support/inquiries", request);
    },

    createReport: async (request: ReportCreateRequest): Promise<void> => {
        await api.post("/support/reports", request);
    },

    // Admin APIs
    getInquiries: async (page = 0, size = 20): Promise<{ content: ServiceInquiry[]; totalPages: number }> => {
        const response = await api.get(`/admin/support/inquiries?page=${page}&size=${size}`);
        return response.data;
    },

    getReports: async (page = 0, size = 20): Promise<{ content: Report[]; totalPages: number }> => {
        const response = await api.get(`/admin/support/reports?page=${page}&size=${size}`);
        return response.data;
    },

    resolveInquiry: async (id: number): Promise<void> => {
        await api.patch(`/admin/support/inquiries/${id}/resolve`);
    },

    resolveReport: async (id: number): Promise<void> => {
        await api.patch(`/admin/support/reports/${id}/resolve`);
    }
};
