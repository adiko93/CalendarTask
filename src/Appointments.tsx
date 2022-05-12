import { scheduleObject } from "./Calendar";

function getRandomInteger(min: number, max: number) {
  return Math.round((Math.random() * (max - min)) / 0.5) * 0.5 + min;
}

const generateAppointment = (startingHour: number, day: number) => {
  return {
    day,
    hourStart: startingHour,
    hourEnd: startingHour + 0.5,
  };
};

const checkIfAppointmentExists = (
  appointments: scheduleObject[],
  randomHour: number,
  randomDay: number
) => {
  return appointments.some(
    (appointment) =>
      appointment.day === randomDay && appointment.hourStart === randomHour
  );
};

export const generateAppointments = (): scheduleObject[] => {
  const dayInMilliseconds = 86400000;
  const currentDate = Date.now();
  const appointments: scheduleObject[] = [];

  while (appointments.length < 15) {
    const randomDayDate = new Date(
      currentDate + getRandomInteger(1, 7) * dayInMilliseconds
    );

    // Max 3 appointments per day
    if (
      appointments.reduce((acc, current) => {
        if (current.day === randomDayDate.getDate()) acc++;
        return acc;
      }, 0) > 3
    )
      continue;

    const randomDayName = randomDayDate
      .toLocaleDateString("en-EN", { weekday: "short" })
      .toUpperCase();

    if (randomDayName === "SAT" || randomDayName === "SUN") {
      if (randomDayName === "SAT" && randomDayDate.getDate() % 2 === 0) {
        let randomHour = getRandomInteger(8, 13.5);
        while (
          randomHour === 11 ||
          checkIfAppointmentExists(
            appointments,
            randomHour,
            randomDayDate.getDate()
          )
        ) {
          randomHour = getRandomInteger(8, 13.5);
        }
        appointments.push(
          generateAppointment(randomHour, randomDayDate.getDate())
        );
      }
    } else {
      if (randomDayDate.getDate() % 2 === 0) {
        let randomHour = getRandomInteger(8, 13.5);
        while (
          randomHour === 11 ||
          checkIfAppointmentExists(
            appointments,
            randomHour,
            randomDayDate.getDate()
          )
        ) {
          randomHour = getRandomInteger(8, 13.5);
        }
        appointments.push(
          generateAppointment(randomHour, randomDayDate.getDate())
        );
      } else {
        let randomHour = getRandomInteger(13, 18.5);
        while (
          randomHour === 16 ||
          checkIfAppointmentExists(
            appointments,
            randomHour,
            randomDayDate.getDate()
          )
        ) {
          randomHour = getRandomInteger(13, 18.5);
        }
        appointments.push(
          generateAppointment(randomHour, randomDayDate.getDate())
        );
      }
    }
  }

  return appointments;
};
