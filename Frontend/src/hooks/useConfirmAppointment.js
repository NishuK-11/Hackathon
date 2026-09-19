import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queries/queryKeys";
import { confirmAppointment } from "../api/backend";

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId) => confirmAppointment(appointmentId),

    // Instantly flip the status in the cache so the UI updates without
    // waiting for the server response.
    onMutate: async (appointmentId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.todaysAppointments });

      const previous = queryClient.getQueryData(queryKeys.todaysAppointments);

      queryClient.setQueryData(queryKeys.todaysAppointments, (old) => {
        if (!old) return old;
        return {
          ...old,
          patients: old.patients.map((p) =>
            p.appointmentId === appointmentId ? { ...p, status: "CONFIRMED" } : p
          ),
        };
      });

      return { previous };
    },

    // Roll back if the request fails
    onError: (_err, _appointmentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.todaysAppointments, context.previous);
      }
    },

    // Re-sync with the server + refresh anything that depends on these counts
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysAppointments, refetchType:'none' });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctorDashboard });
    },
  });
}