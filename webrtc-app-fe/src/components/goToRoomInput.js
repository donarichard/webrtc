import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import shortId from 'shortid'

const goToRoom = (history, roomId) => {
  history.push(`/meeting/${roomId}`)
}


export function GoToRoomInput({history}) {
  let [roomId, setRoomId] = useState(shortId.generate());
  const navigator = useNavigate()
  return (<div className="enter-room-container">
    <form>
          <input type="text" value={roomId} placeholder="Room id" onChange={(event) => {
            setRoomId(event.target.value)
          }}/>
          <button onClick={() => {
            navigator(`/meeting/${roomId}`,{
              roomId:roomId
            })
          }}>Enter</button>
          </form>
        </div>)
}