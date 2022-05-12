import { TagInput, TagProps, Toaster } from "@blueprintjs/core";
import { ReactNode, useMemo, useState } from "react";
import { generateAppointments } from "./Appointments";
import styles from "./Calendar.module.scss";

interface dayObject {
  time: Date;
  dayNumber: number;
  dayName: string;
}

export interface scheduleObject {
  hourStart: number;
  hourEnd: number;
  day: number;
}

type CellTypes = "RESERVED" | "BREAK" | "CLOSED" | "EMPTY" | "SELECTED";

const toaster = Toaster.create({
  position: "top",
});

function Calendar() {
  const [reservations, setReservations] = useState<scheduleObject[]>([]);
  const hoursRange = [7, 19];
  const appointments = useMemo(generateAppointments, []);
  const todayDate = new Date();

  const hourToGridRow = (hour: number) => {
    return hour * 2 - hoursRange[0] * 2 + 1;
  };

  const days = useMemo(() => {
    const todayDate = new Date();
    const dayInMilliseconds = 86400000;
    const daysArray: dayObject[] = [];

    for (let i = 1; i <= 7; i++) {
      const time = new Date(todayDate.getTime() + dayInMilliseconds * i);
      daysArray.push({
        time,
        dayNumber: time.getDate(),
        dayName: time
          .toLocaleDateString("en-EN", { weekday: "short" })
          .toUpperCase(),
      });
    }

    return daysArray;
  }, []);

  const handleAddReservation = (e: any) => {
    const clickedNode = JSON.parse(e.target?.id!);

    if (
      reservations.some((reservation) => clickedNode.day === reservation.day)
    ) {
      toaster.show({
        message: "Only one reservation per day allowed",
      });
      return;
    }

    if (reservations.length >= 2) {
      toaster.show({
        message: "Only two reservations per week allowed",
      });
      return;
    }

    setReservations((reservations) => [
      ...reservations,
      {
        day: clickedNode.day,
        hourStart: clickedNode.hourStart,
        hourEnd: clickedNode.hourStart + 0.5,
      },
    ]);
  };

  const handleDeleteReservation = (index: number) => {
    setReservations((reservations) => {
      const tempReservations = [...reservations];
      tempReservations.splice(index, 1);
      return tempReservations;
    });
  };

  const displaySideHours = () => {
    const sideHours = [];
    const hoursRangeDifference = hoursRange[1] - hoursRange[0];
    for (let i = 0; i <= hoursRangeDifference; i++) {
      sideHours.push(
        <div
          className={styles.calendarBodyLeft}
          key={`${i}`}
          style={{
            gridColumn: "0/1",
            gridRow: `${i * 2 + 1}/${(i + 1) * 2 + 1}`,
          }}
        >
          {i + hoursRange[0]}:00
        </div>
      );
    }
    return sideHours;
  };

  const generateCell = (
    type: CellTypes,
    hourStart: number,
    hourEnd: number,
    day: number,
    index?: number
  ) => {
    let style = {
      gridColumn: `${day + 1}/${day + 2}`,
      gridRow: `${hourToGridRow(hourStart)}/${hourToGridRow(hourEnd)}`,
      borderRight: "1px solid #d7d7d7",
      borderTop:
        hourToGridRow(hourStart) === 1 ? undefined : "1px solid #d7d7d7",
    };
    let className = "";
    let content: ReactNode | string = "";
    let onClick = undefined;
    let id = undefined;
    let displayHoursLabel = true;

    switch (type) {
      case "EMPTY":
        className = `${
          day % 2 === 0
            ? styles.calendarBodyCellOdd
            : styles.calendarBodyCellEven
        }`;
        id = JSON.stringify({ day: days[day - 1]?.dayNumber, hourStart });
        onClick = handleAddReservation;
        displayHoursLabel = false;
        break;
      case "CLOSED":
        content = "Closed";
        className = styles.calendarBodyCellClosed;
        displayHoursLabel = false;
        break;
      case "BREAK":
        content = "Break";
        className = styles.calendarBodyCellBreak;
        break;
      case "RESERVED":
        content = "Reserved";
        className = styles.calendarBodyCellReserved;
        break;
      case "SELECTED":
        content = "Selected";
        className = styles.calendarBodyCellSelected;
        onClick = () => handleDeleteReservation(index!);
        break;
    }

    return (
      <div
        key={`${type}${day}${hourStart}`}
        className={className}
        style={style}
        onClick={onClick}
        id={id}
      >
        {displayHoursLabel ? (
          <>
            <span className={styles.calendarBodyCellHours}>
              {formatHour(hourStart)}-{formatHour(hourEnd)}
            </span>
            <br />
          </>
        ) : null}
        {content}
      </div>
    );
  };

  const generateWorkingDay = (
    hourStart: number,
    hourEnd: number,
    breakTime: number,
    day: number
  ) => {
    const workingDay = [];
    workingDay.push(generateCell("CLOSED", hoursRange[0], hourStart, day));
    workingDay.push(generateCell("BREAK", breakTime, breakTime + 0.5, day));
    workingDay.push(generateCell("CLOSED", hourEnd, hoursRange[1] + 1, day));
    return workingDay;
  };

  const displayGrid = () => {
    const tempGrid: any = [];
    for (let day = 1; day <= 7; day++) {
      const { dayNumber, dayName } = days[day - 1];

      for (let hour = hoursRange[0]; hour <= hoursRange[1] + 0.5; hour += 0.5) {
        tempGrid.push(generateCell("EMPTY", hour, hour + 0.5, day));
      }

      if (dayName === "SAT" || dayName === "SUN") {
        if (dayName === "SAT" && dayNumber % 2 === 0) {
          tempGrid.push(...generateWorkingDay(8, 14, 11, day));
        } else {
          tempGrid.push(
            generateCell("CLOSED", hoursRange[0], hoursRange[1] + 1, day)
          );
        }
      } else {
        if (dayNumber % 2 === 0) {
          tempGrid.push(...generateWorkingDay(8, 14, 11, day));
        } else {
          tempGrid.push(...generateWorkingDay(13, 19, 16, day));
        }
      }
    }

    appointments.forEach(({ hourStart, hourEnd, day }) => {
      tempGrid.push(
        generateCell("RESERVED", hourStart, hourEnd, day - todayDate.getDate())
      );
    });

    reservations.forEach(({ hourEnd, day, hourStart }, index) => {
      tempGrid.push(
        generateCell(
          "SELECTED",
          hourStart,
          hourEnd,
          day - todayDate.getDate(),
          index
        )
      );
    });

    return tempGrid;
  };

  const formatHour = (hour: number) => {
    if (hour % 1 === 0.5) return `${Math.floor(hour)}:30`;
    return `${hour}:00`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <div>
            CEST <br />
            GMT+2
          </div>
          {days.map((day, index) => (
            <div key={`${day}${index}`}>
              <span>{day.dayNumber}</span>
              <br />
              {day.dayName}
            </div>
          ))}
        </div>
        <div
          className={styles.calendarBody}
          style={{
            gridTemplateRows: `repeat(${
              (hoursRange[1] - hoursRange[0] + 1) * 2
            }, 40px)`,
          }}
        >
          {displaySideHours()}
          {displayGrid()}
        </div>
      </div>
      <TagInput
        onRemove={(value, index) => handleDeleteReservation(index)}
        className={styles.input}
        values={reservations.map(
          ({ day, hourEnd, hourStart }) =>
            `${day} ${days[day - days[0].dayNumber].dayName} ${formatHour(
              hourStart
            )}-${formatHour(hourEnd)}`
        )}
        onKeyDown={(event) => event.preventDefault()}
        tagProps={(): TagProps => ({
          style: {
            backgroundColor: "#40c471",
          },
        })}
      />
    </div>
  );
}

export default Calendar;
