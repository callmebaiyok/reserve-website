import axios from 'axios';

// 1. กำหนด Interfaces ตามโครงสร้างข้อมูลของ API จริง
export interface CourtType {
  courtTypeId?: number;
  courtTypeName: string;
  description: string;
  sequence: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isCancel?: string;
  imgUuid: string;
}

export interface Court {
  courtId: number;
  courtTypeId: number;
  courtName: string;
  startReserveDate: string;
  endReserveDate: string;
  startReserveTime: string;
  endReserveTime: string;
  slotTime: number;
  maxSlot: number;
  sequence: number;
  reserveMaxSlot: number;
  slotPrice: string;
  createdAt: string;
  createdBy: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  errorMessage: string;
}

// 2. สร้าง Instance ของ Axios เพื่อกำหนด Base URL
const apiClient = axios.create({
  baseURL: 'https://sportscenter.medicine.psu.ac.th/apis/SportsCenterAPI/v1/reservation',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 3. จัดกลุ่มฟังก์ชันส่งออกสำหรับเรียกใช้งาน
export const apiService = {
  // #GetAllCourtType
  async getAllCourtTypes(isCancel: string = 'N'): Promise<ApiResponse<CourtType[]>> {
    const response = await apiClient.get<ApiResponse<CourtType[]>>('/court-types', {
      params: { 
        isCancel: isCancel // หรือเขียนสั้นๆ แค่ isCancel
      }
    });
    return response.data;
  },

  // #CreateCourtType
  async createCourtType(data: CourtType): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>('/court-types', data);
    return response.data;
  },

  // #UpdateCourtType
  async updateCourtType(id: number, data: Partial<CourtType>): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(`/court-types/${id}`, data);
    return response.data;
  },

  // #DeleteCourtType (มีการส่ง Body ไปกับ DELETE Method)
  async deleteCourtType(id: number, updatedBy: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/court-types/${id}`, {
      data: { updatedBy },
    });
    return response.data;
  },

  // #GetAllCourts
  async getCourtsByTypeId(courtTypeId: number): Promise<ApiResponse<Court[]>> {
    const response = await apiClient.get<ApiResponse<Court[]>>(`/courts?courtTypeId=${courtTypeId}`);
    return response.data;
  },
  async getAllCourts(): Promise<ApiResponse<Court[]>> {
  const response = await apiClient.get<ApiResponse<Court[]>>('/courts');
  return response.data;
},
};