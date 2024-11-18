import React, { createContext, useContext, useState } from "react";

type EventContextType = {
  refreshEvents: () => void;
  trigger: boolean;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trigger, setTrigger] = useState(false);

  const refreshEvents = () => {
    setTrigger((prev) => !prev); // Cambia el estado para forzar actualización
  };

  return (
    <EventContext.Provider value={{ refreshEvents, trigger }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventContext debe usarse dentro de EventProvider");
  }
  return context;
};
