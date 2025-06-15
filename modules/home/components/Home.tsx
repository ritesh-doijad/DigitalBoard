"use client"

import { socket } from "@/common/lib/socket"
import { useSetRoomId } from "@/common/recoil/room/roomHook"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/router"
import { type FormEvent, useEffect, useState } from "react"
import { JoinRoomErrorDialog } from "../modals/JoinRoomErrorDialog"
import { Loader2 } from "lucide-react"

export const Home = () => {
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({
    username: false,
    roomId: false,
  })
  const setReduxRoomId = useSetRoomId()

  const router = useRouter()

  useEffect(() => {
    const handleCreatedRoom = (roomIdFromServer: string) => {
      setIsLoading(false)
      setReduxRoomId(roomIdFromServer)
      router.push(roomIdFromServer)
    }

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      setIsLoading(false)
      if (!failed) {
        setReduxRoomId(roomIdFromServer)
        router.push(roomIdFromServer)
      } else {
        setIsDialogOpen(true)
      }
    }

    socket.on("created", handleCreatedRoom)
    socket.on("joined", handleJoinedRoom)

    return () => {
      socket.off("created", handleCreatedRoom)
      socket.off("joined", handleJoinedRoom)
    }
  }, [router, setReduxRoomId])

  const validateUsername = () => {
    if (!username.trim()) {
      setFormErrors((prev) => ({ ...prev, username: true }))
      return false
    }
    setFormErrors((prev) => ({ ...prev, username: false }))
    return true
  }

  const validateRoomId = () => {
    if (!roomId.trim()) {
      setFormErrors((prev) => ({ ...prev, roomId: true }))
      return false
    }
    setFormErrors((prev) => ({ ...prev, roomId: false }))
    return true
  }

  const handleCreateRoom = () => {
    setIsLoading(true)
    socket.emit("create_room", username || "Anonymous")
  }

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateUsername() || !validateRoomId()) return

    setIsLoading(true)
    socket.emit("join_room", roomId, username)
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Join or Create a Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="font-medium">
                Enter your name
              </Label>
              <Input
                id="username"
                placeholder="Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 15))}
                className={formErrors.username ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {formErrors.username && <p className="text-sm text-red-500">Username is required</p>}
              <p className="text-xs text-muted-foreground">Maximum 15 characters</p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id" className="font-medium">
                  Room ID
                </Label>
                <Input
                  id="room-id"
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className={formErrors.roomId ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {formErrors.roomId && <p className="text-sm text-red-500">Room ID is required</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Room"
                )}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <Separator className="flex-grow" />
              <span className="mx-2 text-xs text-muted-foreground">or</span>
              <Separator className="flex-grow" />
            </div>

            <Button onClick={handleCreateRoom} className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create New Room"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <JoinRoomErrorDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} roomId={roomId} />
    </div>
  )
}
