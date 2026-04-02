import { decryptText } from "@/utils";
import axios from "axios";
import moment from "moment";
import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { ITransactions } from "../interface";
import MainTable from "@/utils/table";
import { useRouter } from "next/router";
import Loading from "@/app/loading";

const localizer = momentLocalizer(moment);

interface Props {
  events: any,
  getExpenseArray: Function,
  menuId: number | undefined,
  currentDate: Date, // Add current date prop
  onNavigate: (date: Date) => void; // Add navigation handler prop
}

const EventCalendar = ({ events, getExpenseArray, menuId, currentDate, onNavigate }: Props) => {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false);
  const token = useSelector((state: any) => state.authReducer.token);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<ITransactions>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowModal(true);
    getExpenseArray(event.getFullYear(), (event.getMonth() + 1))
      .then(() => setIsLoading(false))
      .catch(() => {
        setIsLoading(false);
      });
  };

  const closeAndResetModal = () => {
    setSelectedEvent(null);
    setShowModal(false);
    setTransactionDetails([])
  };

  const columnsDefinition2 =
    transactionDetails.length > 0
      ? Object.keys(transactionDetails?.[0]).map((column) => ({
        name: column,
        selector: column,
        sortable: true,
        wrap: true,
        reorder: true,
      }))
      : [];

  const getCompanyTxns = (company: any) => {
    return new Promise((resolve: any) => {
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetTransactionsENC",
          {
            Userid: localStorage.getItem("username"),
            InputType: "CALENDER",
            Company: company.Company,
            Value: company?.Sno,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res) {
            setTransactionDetails(decryptText(res.data).Transactions);
            resolve(decryptText(res.data).Transactions);
          } else {
            axios
              .post(
                "https://logpanel.insurancepolicy4u.com/api/Login/GetTransactions",
                {
                  Userid: localStorage.getItem("username"),
                  InputType: "CALENDER",
                  Company: company.Company,
                  Value: 1,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              ).then((res) => {
                setTransactionDetails(decryptText(res.data).Transactions);
                resolve(decryptText(res.data).Transactions);
              }).catch((error) => {
                setTransactionDetails([]);
                resolve([]);
              });
          }
        })
        .catch((error) => {
          setTransactionDetails([]);
          resolve([]);
        });
    });
  };

  const formattedEvents = events.map((event: any) => {
    const formattedEventTypes = event.eventTypes.map((eventType: any) => {
      return {
        ...eventType,
        EventDateUTC: eventType.EventDateUTC,
      };
    });
    return {
      ...event,
      eventTypes: formattedEventTypes,
    };
  });

  const flattenedEvents = formattedEvents.flatMap((event: any) => event.eventTypes);
  const formattedEventsNew = flattenedEvents.map((event: any) => ({
    ...event,
    EventDateUTC: new Date(event.EventDateUTC),
  }));

  const handleEditCalendarEvent = (val: any) => {
    menuId && val?.Sno && router.push({
      pathname: "/calendar-event",
      query: { menuId: menuId, recordId: val?.Sno }
    })
  }

  const pageBackgroundcolor = sessionStorage.getItem('pageBackgroundcolor');
  const pageBackgroundimage = sessionStorage.getItem('pageBackgroundimage');
  
  return (
    <div style={{
      backgroundColor: `url(${pageBackgroundcolor})`,
      backgroundImage: `url(${pageBackgroundimage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>

      <Calendar
        events={formattedEventsNew}
        localizer={localizer}
        startAccessor="EventDateUTC"
        endAccessor="EventDateUTC"
        titleAccessor="EventType"
        tooltipAccessor="Description"
        onSelectEvent={handleEventClick}
        views={["month", "week", "day"]}
        defaultView="month"
        date={currentDate} 
        onNavigate={(date: Date) => {
          setIsLoading(true);
          onNavigate(date); // Use the navigation handler from props
        }}
        eventPropGetter={(event: any) => {
          const backgroundColor = event?.ColorCode;
          return {
            style: {
              backgroundColor,
            },
          };
        }}
      />

      {showModal && selectedEvent && (
        <Modal isOpen={showModal} toggle={closeAndResetModal} size="lg">
          <ModalHeader toggle={closeAndResetModal}>{selectedEvent.Description}</ModalHeader>
          <ModalBody>
            <div>
              <h5>Time:
                {moment(selectedEvent.EventDateUTC).format("llll")}
              </h5>
            </div>
            <div>
              {selectedEvent.companiesNames?.map((company: any, index: number) => (
                <div>
                  <Button color="link" className="p-1" style={{ cursor: "pointer" }} onClick={() => getCompanyTxns(company)}>
                    {company.Company}
                  </Button>
                </div>
              ))}
              {transactionDetails.length > 0 && <MainTable TableArray={transactionDetails} columns={columnsDefinition2} editingRow={true} handleSaveChanges={handleEditCalendarEvent} />}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeAndResetModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default EventCalendar;