import { axiosClient } from "./axiosClient";

export interface StudyRoom {
  _id: string;
  name: string;
  createdBy: string;
  members: string[];
  isMember: boolean;
  createdAt: string;
}

export interface RoomMessage {
  _id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export const fetchStudyRooms = async (): Promise<StudyRoom[]> => {
  const { data } = await axiosClient.get("/study-rooms");
  return data.data;
};

export const createStudyRoom = async (name: string): Promise<StudyRoom> => {
  const { data } = await axiosClient.post("/study-rooms", { name });
  return data.data;
};

export const joinStudyRoom = async (roomId: string): Promise<StudyRoom> => {
  const { data } = await axiosClient.post(`/study-rooms/${roomId}/join`);
  return data.data;
};

export const fetchRoomMessages = async (roomId: string): Promise<RoomMessage[]> => {
  const { data } = await axiosClient.get(`/study-rooms/${roomId}/messages`);
  return data.data;
};