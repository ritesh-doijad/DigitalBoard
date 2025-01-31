import { socket } from "@/common/lib/socket"
import { useSetRoomId } from "@/common/recoil/room/roomHook"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/router"
import { FormEvent, useEffect, useState } from "react"



export const Home=()=>{
    const [roomId,setRoomId]=useState("")
    const setReduxRoomId=useSetRoomId()

    const router=useRouter()

    useEffect(()=>{
        socket.on("created",(roomIdFromServer)=>{
            setReduxRoomId(roomIdFromServer)
            router.push(roomIdFromServer)
        })
        socket.on("joined",(roomIdFromServer,failed)=>{
            if(!failed) {
              setReduxRoomId(roomIdFromServer)
              router.push(roomIdFromServer)
            }
            else console.log("failed to join the room")
        })
        return ()=>{
            socket.off("created")
            socket.off("joined")
        }
    },[router,setReduxRoomId])

    const handleCreateRoom=()=>{
        socket.emit("create_room")
    }
    const handleJoinRoom=(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()

        socket.emit("join_room",roomId);
    }

    return(
      <div className="w-full h-screen flex justify-center items-center">
         <div className="container max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Join or Create a Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4"> 
            <form onSubmit={handleJoinRoom} className="space-y-2">
              <Input
                type="text"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Join Room
              </Button>
            </form>
            <div className="text-center">or</div>
            <Button onClick={handleCreateRoom} className="w-full">
              Create New Room
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
       
    )
}