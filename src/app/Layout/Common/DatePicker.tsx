import { useState } from "react";
import { InputGroup } from "reactstrap";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";

export const RCDatePicker = (props: Props) => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());


  return (
    <InputGroup>
      <div className="input-group-text">
        <FontAwesomeIcon icon={faCalendarAlt as any} />
      </div>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="HH:mm"
        timeFormat="HH:mm"
      />
    </InputGroup>
  );
};


interface Props {
  placeholder: string;
  value: Date | null;
  name: string;
  onChange: (date: Date) => void;
}