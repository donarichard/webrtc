import React from 'react';
import io from 'socket.io-client';
import { withRouter } from '../helpers/WithRouter';
import VideoCall from '../helpers/simple-peer';
import '../styles/video.css';
import { CamOffIcon, CamOnIcon, MicOffIcon, MicOnIcon } from './Icons';

class Video extends React.Component {
  constructor() {
    super();
    console.log(this.props)
    this.state = {
      localStream: {},
      remoteStreamUrl: '',
      streamUrl: '',
      initiator: false,
      peer: {},
      full: false,
      connecting: false,
      waiting: true,
      micState:true,
      camState:true,
    };
  }
  videoCall = new VideoCall();

  componentDidMount() {
    const socket = io('https://7c2a-2405-201-e052-4810-8c99-3321-7bac-8a23.ngrok-free.app');
    const component = this;
    this.setState({ socket });
    const { roomId } = this.props.match.params;
    console.log(this.props)
    this.getUserMedia().then(() => {
      console.log(roomId,"roomId")
      socket.emit('join',  { roomId });
    });

    socket.on('init', () => {
      component.setState({ initiator: true });
    });
    socket.on('ready', () => {
      component.enter(roomId);
    });
    socket.on('desc', data => {
      if (data.type === 'offer' && component.state.initiator) return;
      if (data.type === 'answer' && !component.state.initiator) return;
      component.call(data);
    });
    socket.on('disconnected', () => {
      component.setState({ initiator: true });
    });
    socket.on('full', () => {
      component.setState({ full: true });
    });
  }


  getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const op = {
        video: {
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        audio: true
      };
      navigator.getUserMedia(
        op,
        stream => {
          this.setState({ streamUrl: stream, localStream: stream });
          this.localVideo.srcObject = stream;
          resolve();
        },
        () => {}
      );
    });
  }

  setAudioLocal(){
    if(this.state.localStream.getAudioTracks().length>0){
      this.state.localStream.getAudioTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    this.setState({
      micState:!this.state.micState
    })
  }

  setVideoLocal(){
    if(this.state.localStream.getVideoTracks().length>0){
      this.state.localStream.getVideoTracks().forEach(track => {
        track.enabled=!track.enabled;
      });
    }
    this.setState({
      camState:!this.state.camState
    })
  }


  enter = roomId => {
    this.setState({ connecting: true });
    const peer = this.videoCall.init(
      this.state.localStream,
      this.state.initiator
    );
    this.setState({ peer });

    peer.on('signal', data => {
      const signal = {
        room: roomId,
        desc: data
      };
      this.state.socket.emit('signal', signal);
    });
    peer.on('stream', stream => {
      this.remoteVideo.srcObject = stream;
      this.setState({ connecting: false, waiting: false });
    });
    peer.on('error', function(err) {
      console.log(err);
    });
  };

  call = otherId => {
    this.videoCall.connect(otherId);
  };
  renderFull = () => {
    if (this.state.full) {
      return 'The room is full';
    }
  };
  render() {
    return (
      <div className='video-wrapper'>
        <div className='local-video-wrapper'>
          <video
            autoPlay
            id='localVideo'
            muted
            ref={video => (this.localVideo = video)}
          />
        </div>
        <video
          autoPlay
          className={`${
            this.state.connecting || this.state.waiting ? 'hide' : ''
          }`}
          id='remoteVideo'
          ref={video => (this.remoteVideo = video)}
        />

        <div className='controls'>
        <button
        className='control-btn'
          onClick={() => {
            this.setAudioLocal();
          }}
        >
          {
            this.state.micState?(
              <MicOnIcon/>
            ):(
              <MicOffIcon/>
            )
          }
        </button>

        <button
        className='control-btn'
          onClick={() => {
            this.setVideoLocal();
          }}
        >
          {
            this.state.camState?(
              <CamOnIcon/>
            ):(
              <CamOffIcon/>
            )
          }
        </button>
        </div>
        


        {this.state.connecting && (
          <div className='status'>
            <p>Establishing connection...</p>
          </div>
        )}
        {this.state.waiting && (
          <div className='status'>
            <p>Waiting for someone...</p>
          </div>
        )}
        {this.renderFull()}
      </div>
    );
  }
}

export default withRouter(Video);