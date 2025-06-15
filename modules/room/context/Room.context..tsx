import { createContext, ReactNode, useEffect, useState } from "react";
import { MotionValue, useMotionValue } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import { socket } from "@/common/lib/socket";
import { RootState } from "@/common/recoil";
import { addUser, removeUser, setRoom, setUsersAndMoves } from "@/common/recoil/room/roomSlice";

// Create context with default values
export const roomContext = createContext<{
  x: MotionValue<number>;
  y: MotionValue<number>;
}>(null!);

// Define the RoomContextProvider component
const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.room.users);  // Get users state as Map<string, string>
  const [userIds, setUserIds] = useState<string[]>([]);  // Local state for user IDs

  // Initialize MotionValues for x and y
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Update local userIds state when Redux users change
  useEffect(() => {
    setUserIds(Array.from(users.keys()));  // Extract user IDs from the Map
  }, [users]);

  useEffect(() => {
    socket.on("room", (room, userMovesToParse, usersToParse) => {
      // Check if the values are defined and not empty
      if (userMovesToParse && usersToParse) {
        try {
          const usersMoves = new Map<string, Move[]>(JSON.parse(userMovesToParse));
          const users = new Map<string, string>(JSON.parse(usersToParse)); // Create Map from JSON data
  
          const usersMovesObj = Object.fromEntries(usersMoves);
          console.log("Users Moves:", usersMovesObj);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        console.error("Received undefined or invalid data:", { userMovesToParse, usersToParse });
      }
    });

    socket.on("new_user", (userId: string, name: string) => {
      dispatch(addUser({ userId, name })); // Add the new user to Redux store
    });

    socket.on("user_disconnected", (userId: string) => {
      dispatch(removeUser(userId)); // Remove the user from Redux store
    });

    return () => {
      socket.off("new_user");
      socket.off("user_disconnected");
    };
  }, [dispatch, users]);  // Dependency array updated to include users

  return (
    <roomContext.Provider value={{ x, y }}>
      {children}
    </roomContext.Provider>
  );
};

export default RoomContextProvider;
