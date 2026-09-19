import {
  Stethoscope,
  CalendarDays,
  Users,
} from "lucide-react";

export const lockedFeatures = [
  {
    id: 1,
    title: "Start OPD",
    description:
      "Manage OPD sessions, patient queue and consultations.",
    icon: Stethoscope,
    status: "Locked",
    buttonText: "Complete Profile to Access",
  },

  {
    id: 2,
    title: "Appointments",
    description:
      "View and manage upcoming patient appointments.",
    icon: CalendarDays,
    status: "Locked",
    buttonText: "Complete Profile to Access",
  },

  {
    id: 3,
    title: "Patients",
    description:
      "Access patient records and consultation history.",
    icon: Users,
    status: "Locked",
    buttonText: "Complete Profile to Access",
  },
];