import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EventCalendar from "./EventCalendar";
import { decryptText } from "@/utils";
import moment from "moment";
import { Badge, Box, Tab, Tabs, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import { FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainTable from "@/utils/table";
import { setLoading } from "@/reducers/Auth";
import Loading from '@/app/loading';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const CalendarComponent = () => {
  const router = useRouter()
  const token = useSelector((state: any) => state.authReducer.token);
  const [events, setEvents] = useState<any>([]);
  useEffect(() => {
    console.log("Events in production:", events);
  }, [events]);
  const [value, setValue] = useState(0);
  const [menuID, setMenuID] = useState<number | undefined>()
  const [colorArray, setColorArray] = useState<any>();
  const [todayCount, setTodayCounts] = useState<number[]>([]);

  // Add state to track current calendar view
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (token) {
      getExpenseArray(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1);
    }
  }, [token]);

  const [isLoading, setIsLoading] = useState(false);

  const getExpenseArray = (year?: number, month?: number) => {
    return new Promise<void>((resolve, reject) => {
      setIsLoading(true);
      try {
        axios
          .post(
            "https://logpanel.insurancepolicy4u.com/api/Login/GetCalenderENC",
            {
              Userid: localStorage.getItem("username"),
              "Month": month ?? currentCalendarDate.getMonth() + 1,
              "Year": year ?? currentCalendarDate.getFullYear()
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((res) => {
            const decrypted = decryptText(res.data);
            if (decrypted && decrypted.calenders) {
              setMenuID(decrypted?.MenuID)
              setEvents(decrypted.calenders);
              setColorArray(decrypted?.colorsconfig)
            }
            resolve();
          })
          .catch((error) => {
            console.error('error', error)
            setEvents([])
            reject();
          })
          .finally(() => {
            setIsLoading(false)
          })
      } catch (error) {
        console.error('error', error)
        setEvents([])
        reject();
      }
    });
  };

  // Function to handle calendar navigation
  const handleCalendarNavigate = (date: Date) => {
    // Check if month or year has changed
    const newMonth = date.getMonth() + 1;
    const newYear = date.getFullYear();
    const currentMonth = currentCalendarDate.getMonth() + 1;
    const currentYear = currentCalendarDate.getFullYear();

    // Only update and call API if month or year changed
    if (newMonth !== currentMonth || newYear !== currentYear) {
      setCurrentCalendarDate(date);
      getExpenseArray(newYear, newMonth);
    } else {
      // Just update the date for UI, but don't call API
      setCurrentCalendarDate(date);
    }
  };

  function formatDate(inputDate: string) {
    const [day, month, year] = inputDate.split('-').map(Number);
    return `${day} ${month} ${year}`;
  }

  function formatTodataData(inputDate: any) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  useEffect(() => {
    if (events && events.length > 0) {
      const counts = events.map((item: any) => {
        const todayEvents = item?.eventDates?.filter((event: any) =>
          formatDate(event.EventDate) === formatTodataData(new Date())
        ) || [];

        return todayEvents.reduce((count: number, eventDate: any) =>
          count + (eventDate?.eventTypes?.length || 0), 0);
      });
      setTodayCounts(counts);
    }
  }, [events]);

  useEffect(() => {
    console.log("Token:", token);
    console.log("Username:", typeof window !== "undefined" ? localStorage.getItem("username") : null);
  }, [token]);

  useEffect(() => {
    console.log("Events in production:", events);
  }, [events]);

  return (
    <div className="w-full">
      {isLoading && <Loading />}
      <div className="flex w-11/12 justify-between">
        <h3 style={{ margin: "20px 0px" }}>Calendar</h3>
        <Link
          href={{
            pathname: "/calendar-event",
            query: { heading: "Calendar Form", menuId: "229", recordId: "0" }
          }}
        >
          <Button
            variant="contained" className="hover:text-[#fff] text-black text-center">
            <FaEdit className=" " /><span className="">Add New</span>
          </Button>
        </Link>
      </div>
      <div>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            {
              events.map((item: any, index: number) => (
                <Tab
                  label={
                    <Badge
                      badgeContent={todayCount[index] || 0}
                      color="primary" max={99999}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      className="css-21152c-MuiButtonBase-root-MuiTab-root.Mui-selected"
                    >
                      <div style={{ width: "100%", height: "30px", padding: "10px" }} className=''>
                        {item.CalenderType}
                      </div>
                    </Badge>}
                  {...a11yProps(index)}
                  key={index}
                />
              ))
            }
          </Tabs>
        </Box>
        {
          events.map((item: any, index: number) => (
            <CustomTabPanel value={value} index={index} key={index}>
              <EventCalendar
                menuId={menuID}
                events={item?.eventDates}
                getExpenseArray={getExpenseArray}
                currentDate={currentCalendarDate}
                onNavigate={handleCalendarNavigate} // Pass navigation handler
              />

              {item?.colorsconfig && item.colorsconfig.length > 0 && (
                <div className="mt-3">
                  <MainTable
                    title="colorsconfig"
                    TableArray={item.colorsconfig}
                    columns={
                      item.colorsconfig && Object.keys(item.colorsconfig[0]).map((column) => {
                        if (column === "ColorCode") {
                          return {
                            name: column,
                            selector: (row: any) => {
                              return (
                                <div
                                  style={{ color: "#0088ff", width: "200px", height: "40px", backgroundColor: `${row?.ColorCode}`, cursor: "pointer" }}
                                >
                                </div>
                              )
                            },
                            sortable: true,
                            reorder: true,
                          };
                        } else {
                          return {
                            name: column,
                            selector: column,
                            sortable: true,
                            wrap: true,
                            reorder: true,
                          };
                        }
                      })
                    }
                  />
                </div>
              )}
            </CustomTabPanel>
          ))
        }
      </div>
    </div>
  );
};

export default CalendarComponent