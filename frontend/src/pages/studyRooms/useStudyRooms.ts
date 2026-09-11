import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudyRooms, createStudyRoom, joinStudyRoom } from "../../api/studyRooms.api";

export const useStudyRooms = () => {
  return useQuery({
    queryKey: ["studyRooms"],
    queryFn: fetchStudyRooms,
  });
};

export const useCreateStudyRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudyRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyRooms"] }),
  });
};

export const useJoinStudyRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinStudyRoom,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyRooms"] }),
  });
};