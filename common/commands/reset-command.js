export default function ResetCommand(oldState, newState) {

  const self = this;

  return {
    execute() {
      return self.setStateAsync({ ...newState });   
    },
    
    undo() {
      return self.setStateAsync({ ...oldState });   
    }
  }
}

