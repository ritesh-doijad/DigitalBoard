// import { useSelector, useDispatch } from 'react-redux';

// import { setUsers, updateUser } from './usersSlice';
// import { RootState } from '..';

// interface UserData {
//   [key: string]: Move[];  
// }


// export const useUserIds = () => {
//   const users = useSelector((state: RootState) => state.users) || {}; 
//   return Object.keys(users);  
// };


// export const useUsers = (): UserData => {
//   const users = useSelector((state: RootState) => state.users);
//   return users || {};  
// };


// export const useSetUsers = () => {
//   const dispatch = useDispatch();
//   return (users: UserData) => dispatch(setUsers(users)); 
// };

// // Hook to update a specific user's data
// export const useUpdateUser = () => {
//   const dispatch = useDispatch();
//   return (id: string, data: Move[]) => dispatch(updateUser({ id, data }));  
// };
