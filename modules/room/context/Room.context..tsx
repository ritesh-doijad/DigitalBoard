import { createContext, ReactNode, useEffect, useState } from "react";
import { MotionValue, useMotionValue } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setUsers, updateUser } from "@/common/recoil/users/usersSlice"; // Adjust based on your slice
import { socket } from "@/common/lib/socket";
import { RootState } from "@/common/recoil/users";

// Create context with default values
export const roomContext = createContext<{
  x: MotionValue<number>;
  y: MotionValue<number>;
}>(null!);

// Define the RoomContextProvider component
const RoomContextProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const users = useSelector((state: RootState) => state.users);  // Get users state
  const [userIds, setUserIds] = useState<string[]>([]);  // Local state for user IDs

  // Initialize MotionValues for x and y
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Update local userIds state when Redux users change
  useEffect(() => {
    setUserIds(Object.keys(users || {}));  // Fallback to an empty object if users is undefined or null
  }, [users]);
  

  useEffect(() => {
    socket.on("new_user", (newUsers: string) => {
      dispatch(setUsers({ ...users, [newUsers]: [] }));
    });

    socket.on("user_disconnected", (userId: string) => {
      dispatch(updateUser({ id: userId, data: [] })); // Remove user from Redux state
    });

    return () => {
      socket.off("new_user");
      socket.off("user_disconnected");
    };
  }, [dispatch, userIds]);  // Dependency array updated to include userIds

  return (
    <roomContext.Provider value={{ x, y }}>
      {children}
    </roomContext.Provider>
  );
};

export default RoomContextProvider;
