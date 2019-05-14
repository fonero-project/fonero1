import DaemonLoadingForm from "./Form";
import ReactTimeout from "react-timeout";
import { getFnowalletLastLogLine } from "wallet";

function parseLogLine(line) {
  const res = /^[\d :\-.]+ \[...\] (.+)$/.exec(line);
  return res ? res[1] : "";
}

@autobind
class DaemonLoading extends React.Component {
  constructor(props)  {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState() {
    return {
      showLongWaitMessage: false,
      neededBlocksDeterminedAt: new Date(),
      lastFnodLogLine: "",
      lastFnowalletLogLine: "",
      passPhrase: "",
      hasAttemptedDiscover: false
    };
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidMount() {
    this.props.setInterval(() => {
      Promise
        .all([ getFnowalletLastLogLine() ])
        .then(([ fnowalletLine ]) => {
          const lastFnowalletLogLine = parseLogLine(fnowalletLine);
          if (lastFnowalletLogLine !== this.lastFnowalletLogLine)
          {
            this.lastFnowalletLogLine = lastFnowalletLogLine;
          }
        });
    }, 2000);
    this.mounted = true;
    this.timeoutId = this.props.setTimeout(() => {
      if (this.mounted) {
        this.setState({ showLongWaitMessage: true });
      }
    }, 2000);
  }

  render() {
    const { showLongWaitMessage, passPhrase, hasAttemptedDiscover } = this.state;
    const { onSetPassPhrase, onRPCSync, onKeyDown, lastFnowalletLogLine } = this;
    const secondsLeft = this.props.getEstimatedTimeLeft;
    let finishDateEstimation = null;
    if (secondsLeft !== null) {
      finishDateEstimation = new Date();
      finishDateEstimation.setSeconds(finishDateEstimation.getSeconds() + secondsLeft);
    }
    return (
      <DaemonLoadingForm
        {...{
          ...this.props,
          showLongWaitMessage,
          finishDateEstimation,
          lastFnowalletLogLine,
          passPhrase,
          hasAttemptedDiscover,
          onSetPassPhrase,
          onRPCSync,
          onKeyDown
        }}
      />
    );
  }

  resetState() {
    this.setState(this.getInitialState());
  }

  onSetPassPhrase(passPhrase) {
    if (passPhrase != "") {
      this.setState({ hasAttemptedDiscover: true });
    }

    this.setState({ passPhrase });
  }

  onRPCSync() {
    const { passPhrase } = this.state;

    if (!passPhrase) {
      return this.setState({ hasAttemptedDiscover: true });
    }

    const { onRetryStartRPC, onSetWalletPrivatePassphrase } = this.props;

    onSetWalletPrivatePassphrase && onSetWalletPrivatePassphrase(passPhrase);
    onRetryStartRPC(false, passPhrase);
    this.resetState();
  }

  onKeyDown(e) {
    if (e.keyCode == 13) {   // Enter key
      e.preventDefault();
      this.onRPCSync();
    }
  }

}

export default ReactTimeout(DaemonLoading);
