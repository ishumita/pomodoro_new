import React, {} from 'react'
import './App.css';

// TimeContext.js



// TimeContext.js

const TimeContext = React.createContext();

const TimeProvider = props => {
    const [timer, setTimer] = React.useState({
        session: 1500,
        break: 300,
        mode: 'session',
        time: { currentTime: 1500, startingTime: 1500 },
        active: false,
        name: 'Pomodoro Timer',
        progress: 0
    });

    return (
        <TimeContext.Provider value={[timer, setTimer]}>
            {props.children}
        </TimeContext.Provider>
    );
};

// App.js

function App() {
  return (
      <TimeProvider>
          <div className="App">
              <Pomodoro />
          </div>
      </TimeProvider>
  );
}
export default App


// Pomodoro.js

function Pomodoro() {
    
    const [timer, setTimer] = React.useContext(TimeContext);
    // create ref for the audio
    const beep = React.useRef();
    

    React.useEffect(() => {
        if(timer.active  && timer.time.currentTime > 0){
                const interval = setInterval(() => {
                    setTimer({
                        ...timer, 
                        time: {
                            startingTime: timer.time.startingTime,
                            currentTime: timer.time.currentTime-1
                    }});
                }, 1000);
                return () => clearInterval(interval);
        } else if (timer.time.currentTime === 0) {
                beep.current.play();
                beep.current.currentTime = 0;
                //    setTimeout(() => {
                       if (timer.mode === 'session') {
                           setTimer({
                               ...timer,
                               time: {
                                   currentTime: timer.break,
                                   startingTime: timer.break
                               },
                               mode: 'break',
                           });
                       }
                       if (timer.mode === 'break') {
                           setTimer({
                               ...timer,
                               time: {
                                   currentTime: timer.session,
                                   startingTime: timer.session
                               },
                               mode: 'session',
                               progress: timer.progress+1,
                           });
                       }
                //    }, 2500);
                   
               }
    }, [setTimer, timer]);

    React.useEffect(() => {
        if(timer.playPause){
            beep.current.pause();
            beep.current.currentTime = 0;
        }
    })

     return (
         <div className="pomodoro">
             <Title title={timer.name} />
             <Timer time={timer.time} mode={timer.mode} />

             <Progress progress={timer.progress} />

             <TimeController
                 durationId={timer.session}
                 type="session"
                 label={'Session'}
                 lengthId={'session-length'}
                 labelId={'session-label'}
             />
             <TimeController
                 durationId={timer.break}
                 type="break"
                 label={'Break'}
                 lengthId={'break-length'}
                 labelId={'break-label'}
             />
             <ButtonController playing={timer.active} myRef={beep}/>
             <audio
                 id="beep"
                 preload="auto"
                 src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
                 ref={beep}
             ></audio>
         </div>
     );
}



// Title.js

const Title = (props) => {
    return (
        <header>
            <h1 className="title">{props.title}</h1>
        </header>
    );
}

// Timer.js

const Timer = (props) => {
    
    function formatTime(time){ 
        let minutes = Math.floor(time / 60);
        if(minutes < 10){
            minutes = "0"+minutes
        }
        let seconds = Math.floor(time - minutes * 60);
        if(seconds < 10){
            seconds = "0"+seconds
        }
        return `${minutes}:${seconds}`;
    }
    
    return (
        <div className="wrapper">
            <div className="counter">
                <span className="counterType" id="timer-label">{props.mode}</span>
                <span id="time-left">{formatTime(props.time.currentTime)}</span>
            </div>
        </div>
    );
}

// Progress.js

const Progress = props => {
    let progress = new Array(4).fill(0).fill(true, 0, props.progress);
    return (
        <div>
            {progress.map((item, index) => (
                <span
                    key={index}
                    className={`dot ${progress[index] ? 'completed' : ''}`}
                ></span>
            ))}
        </div>
    );
};

// TimeController.js

function TimeController(props) {
    const [timer, setTimer] = React.useContext(TimeContext);

    // update session time / break time on click
    const changeTimer = operator => {
        let mode = timer.mode;
        console.log(mode);
        if (timer.mode === props.type) {
            console.log('same mode');
            if (operator === 'decrement' && timer[props.type] > 60) {
                //if the current mode && the type are equal change the currentTime & startingTime
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] - 60, // change session / break time
                    time: {
                        currentTime: timer[timer.mode] - 60,
                        startingTime: timer[timer.mode] - 60
                    }
                });
            }
            if (operator === 'increment' && timer[props.type] < 3600) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] + 60,
                    time: {
                        currentTime: timer[timer.mode] + 60,
                        startingTime: timer[timer.mode] + 60
                    }
                });
            }
        } else {
            let time = timer.time;
            if (operator === 'decrement' && timer[props.type] > 60) {
                //if the current mode && the type are equal change the currentTime & startingTime
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] - 60, // change session / break time
                    time: time
                });
            }
            if (operator === 'increment' && timer[props.type] < 3600) {
                setTimer({
                    ...timer,
                    [props.type]: timer[props.type] + 60,
                    time: time
                });
            }
        }
    };

    return (
        <div className="TimeController">
            <Button
                actionClick={() => changeTimer('decrement')}
                className="controlButton"
                buttonId={`${props.type}-decrement`}
            >
                -
            </Button>
            <div className="wrapperDisplay">
                <span id={props.labelId} className="label">
                    {props.label}
                </span>
                <span id={props.lengthId} className="time">
                    {timer[props.type] / 60}
                </span>
            </div>
            <Button
                actionClick={() => changeTimer('increment')}
                className="controlButton"
                buttonId={`${props.type}-increment`}
            >
                +
            </Button>
        </div>
    );
}

// ButtonController.js

function ButtonController(props) {
    const [timer, setTimer] = React.useContext(TimeContext);

    const resetTime = (sessionValue) => {
        console.log(timer);
        setTimer({...timer,
            session: 1500,
            break: 300,
            mode: 'session',
            time: { currentTime: 1500, startingTime: 1500 },
            active: false,
            name: 'Pomodoro Timer',
            progress: 0,
            
        });
        props.myRef.current.pause();
        props.myRef.current.currentTime = 0;
    }

    const setActive = () => {
        setTimer({
            ...timer,
            active: !timer.active
        })
    }
    
    return (
        <div className="ButtonController">
            <Button buttonId="reset" type="reset" actionClick={() => resetTime()}>
              Reset
                <i className="fas fa-undo-alt"></i>
            </Button>
            <Button buttonId="start_stop" type="play" actionClick={() => setActive()}>
              
               {timer.active ? "Pause" : "Start"}
            </Button>
        </div>
    )
}

//Button.js

function Button(props) {
    return(
        <button id={props.buttonId} className="Button" onClick={() => props.actionClick(props.type)}>
            {props.children}
        </button>
    )
}

