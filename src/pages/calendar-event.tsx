import EventForm from '@/app/Layout/calender-event/EventForm'
import React, { useCallback, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function  CalendarEvent() {
  const [hideSourceOnDrag, setHideSourceOnDrag] = useState(true)
  const toggle = useCallback(
    () => setHideSourceOnDrag(!hideSourceOnDrag),
    [hideSourceOnDrag],
  )
  return (
    <div className='bg-white w-full'>
      <DndProvider backend={HTML5Backend}>
        <EventForm
        hideSourceOnDrag={hideSourceOnDrag}
        />
      </DndProvider>
    </div>
  )
}

export default CalendarEvent
